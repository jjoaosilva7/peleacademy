/*
 * Entrada com Google e Apple.
 *
 * Google: Google Identity Services (fluxo de token em janela pop-up). Precisa de um
 *   ID de cliente OAuth criado no Google Cloud Console, com a origem do site autorizada.
 * Apple: Sign in with Apple JS (pop-up). Precisa de uma conta paga no Apple Developer Program,
 *   um Services ID com o domínio e a URL de retorno cadastrados.
 *
 * As chaves ficam em variáveis de ambiente (arquivo .env, veja .env.example):
 *   VITE_GOOGLE_CLIENT_ID, VITE_APPLE_CLIENT_ID e VITE_APPLE_REDIRECT_URI.
 * Sem a chave de um provedor, o botão dele abre a escolha de conta de demonstração.
 *
 * Nesta versão o token é lido no navegador para obter e-mail e nome. Em produção,
 * o token deve ser validado no servidor antes de criar a sessão.
 */
export type Provedor = 'google' | 'apple';

export const NOME_PROVEDOR: Record<Provedor, string> = { google: 'Google', apple: 'Apple' };

export interface IdentidadeSocial {
  provedor: Provedor;
  email: string;
  nome: string | null;
}

const CONFIG = {
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined,
  appleClientId: import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined,
  appleRedirectUri: import.meta.env.VITE_APPLE_REDIRECT_URI as string | undefined,
};

export function provedorConfigurado(provedor: Provedor): boolean {
  return provedor === 'google' ? Boolean(CONFIG.googleClientId) : Boolean(CONFIG.appleClientId && CONFIG.appleRedirectUri);
}

/* ---------- Tipos mínimos das bibliotecas carregadas por script ---------- */

interface TokenGoogle { access_token?: string; error?: string }
interface ClienteTokenGoogle { requestToken: () => void }
interface GoogleGlobal {
  accounts: {
    oauth2: {
      initTokenClient: (cfg: { client_id: string; scope: string; callback: (r: TokenGoogle) => void; error_callback?: (e: { type: string }) => void }) => ClienteTokenGoogle;
    };
  };
}
interface AppleResposta { authorization: { id_token: string }; user?: { name?: { firstName?: string; lastName?: string }; email?: string } }
interface AppleGlobal {
  auth: {
    init: (cfg: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }) => void;
    signIn: () => Promise<AppleResposta>;
  };
}
type JanelaComLibs = Window & { google?: GoogleGlobal; AppleID?: AppleGlobal };

function carregarScript(src: string, pronto: () => boolean): Promise<void> {
  if (pronto()) return Promise.resolve();
  return new Promise((resolver, rejeitar) => {
    const existente = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    const script = existente ?? document.createElement('script');
    const tempo = window.setTimeout(() => rejeitar(new Error('tempo')), 12000);
    script.addEventListener('load', () => { window.clearTimeout(tempo); resolver(); });
    script.addEventListener('error', () => { window.clearTimeout(tempo); rejeitar(new Error('bloqueado')); });
    if (!existente) {
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

function lerPayloadJwt(token: string): Record<string, unknown> {
  const parte = token.split('.')[1] ?? '';
  const base64 = parte.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(decodeURIComponent(Array.from(atob(base64), (c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')));
}

export class ErroSocial extends Error {
  constructor(public motivo: 'cancelado' | 'bloqueado' | 'sem-email' | 'falha') {
    super(motivo);
  }
}

export async function entrarComGoogle(): Promise<IdentidadeSocial> {
  const janela = window as JanelaComLibs;
  try {
    await carregarScript('https://accounts.google.com/gsi/client', () => Boolean(janela.google?.accounts?.oauth2));
  } catch {
    throw new ErroSocial('bloqueado');
  }
  const token = await new Promise<string>((resolver, rejeitar) => {
    const cliente = janela.google!.accounts.oauth2.initTokenClient({
      client_id: CONFIG.googleClientId!,
      scope: 'openid email profile',
      callback: (r) => (r.access_token ? resolver(r.access_token) : rejeitar(new ErroSocial('falha'))),
      error_callback: (e) => rejeitar(new ErroSocial(e.type === 'popup_closed' ? 'cancelado' : 'falha')),
    });
    cliente.requestToken();
  });
  const resposta = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${token}` } });
  if (!resposta.ok) throw new ErroSocial('falha');
  const perfil = (await resposta.json()) as { email?: string; name?: string };
  if (!perfil.email) throw new ErroSocial('sem-email');
  return { provedor: 'google', email: perfil.email, nome: perfil.name ?? null };
}

export async function entrarComApple(): Promise<IdentidadeSocial> {
  const janela = window as JanelaComLibs;
  try {
    await carregarScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/pt_BR/appleid.auth.js', () => Boolean(janela.AppleID?.auth));
  } catch {
    throw new ErroSocial('bloqueado');
  }
  janela.AppleID!.auth.init({ clientId: CONFIG.appleClientId!, scope: 'name email', redirectURI: CONFIG.appleRedirectUri!, usePopup: true });
  let resposta: AppleResposta;
  try {
    resposta = await janela.AppleID!.auth.signIn();
  } catch (e) {
    const erro = e as { error?: string };
    throw new ErroSocial(erro?.error === 'popup_closed_by_user' ? 'cancelado' : 'falha');
  }
  const payload = lerPayloadJwt(resposta.authorization.id_token) as { email?: string };
  const email = resposta.user?.email ?? payload.email;
  if (!email) throw new ErroSocial('sem-email');
  const nome = resposta.user?.name ? [resposta.user.name.firstName, resposta.user.name.lastName].filter(Boolean).join(' ') : null;
  return { provedor: 'apple', email, nome: nome || null };
}

export function entrarComProvedorReal(provedor: Provedor): Promise<IdentidadeSocial> {
  return provedor === 'google' ? entrarComGoogle() : entrarComApple();
}

export const MENSAGEM_ERRO: Record<ErroSocial['motivo'], string> = {
  cancelado: 'A janela de login foi fechada antes de terminar.',
  bloqueado: 'O login não pôde ser carregado aqui. Tente pelo site publicado ou entre com e-mail e senha.',
  'sem-email': 'A conta não compartilhou um e-mail. Permita o e-mail ou entre de outra forma.',
  falha: 'Não foi possível entrar agora. Tente de novo ou use e-mail e senha.',
};
