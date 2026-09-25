// Tela de entrar: login de atleta e equipe, Google/Apple e contas de demonstração. (Guilherme de Paula Correia · Grupo Zenyth)
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { Eye, EyeOff, Lock, Mail, RotateCcw } from 'lucide-react';
import { useEstado } from '../../estado/EstadoApp';
import { CONTAS_DEMONSTRACAO, SENHA_DEMONSTRACAO } from '../../dados/exemplo';
import { validarEmail } from '../../lib/regras';
import { primeiroNome } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { Botao } from '../../componentes/ui/Botao';
import { CampoTexto } from '../../componentes/ui/Campo';
import { Escolha } from '../../componentes/ui/Escolha';
import { useAviso } from '../../componentes/ui/Aviso';
import { LogoPele } from '../../componentes/abertura/LogoPele';
import { EntradaSocial } from '../../componentes/dominio/EntradaSocial';

type TipoAcesso = 'atleta' | 'equipe';

export function Entrar() {
  useTitulo('Entrar');
  const { db, usuario, entrar, restaurarExemplo } = useEstado();
  const avisar = useAviso();
  const navegar = useNavigate();
  const [tipo, setTipo] = useState<TipoAcesso>('atleta');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  if (usuario) return <Navigate to={usuario.tipo === 'equipe' ? '/equipe' : '/atleta'} replace />;

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const novosErros: typeof erros = {};
    if (!validarEmail(email)) novosErros.email = 'Informe um e-mail válido, como nome@exemplo.com.';
    if (!senha) novosErros.senha = 'Informe sua senha.';
    setErros(novosErros);
    setErroGeral(null);
    if (novosErros.email || novosErros.senha) {
      document.getElementById(novosErros.email ? 'email' : 'senha')?.focus();
      return;
    }
    const resultado = entrar(email, senha, tipo);
    if (!resultado.ok) {
      setErroGeral(resultado.mensagem);
      return;
    }
    const conta = db.usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    avisar(conta ? `Olá, ${primeiroNome(conta.nome)}. Bom te ver por aqui.` : 'Bom te ver por aqui.', 'sucesso');
    navegar(tipo === 'equipe' ? '/equipe' : '/atleta');
  }

  function usarConta(conta: (typeof CONTAS_DEMONSTRACAO)[number]) {
    setTipo(conta.tipo);
    setEmail(conta.email);
    setSenha(SENHA_DEMONSTRACAO);
    setErros({});
    setErroGeral(null);
    document.getElementById('botao-entrar')?.focus();
  }

  function restaurar() {
    restaurarExemplo();
    avisar('Os dados de exemplo foram restaurados.', 'info');
  }

  return (
    <div className="fundo-noite flex min-h-full flex-col items-center px-4 py-8 text-white md:py-12">
      <header className="flex flex-col items-center text-center">
        <LogoPele className="w-52 md:w-64" />
        <p className="mt-5 max-w-sm text-center font-display text-4xl font-extrabold uppercase leading-[0.95] md:text-5xl">Onde o legado entra em campo</p>
      </header>

      <main id="conteudo" className="mt-8 w-full max-w-md">
        <div className="rounded-xl bg-superficie p-5 text-tinta shadow-2xl md:p-7">
          <h1 className="text-4xl text-tinta">Bem-vindo de volta</h1>
          <p className="mt-1 text-tinta-suave">Entre para acompanhar treinos, cartão e peneiras.</p>

          <form noValidate onSubmit={enviar} className="mt-6 flex flex-col gap-4">
            <Escolha<TipoAcesso>
              nome="tipo-acesso"
              legenda="Tipo de acesso"
              legendaOculta
              valor={tipo}
              aoMudar={(v) => {
                setTipo(v);
                setErroGeral(null);
              }}
              opcoes={[
                { valor: 'atleta', rotulo: 'Atleta' },
                { valor: 'equipe', rotulo: 'Equipe' },
              ]}
            />

            {erroGeral && (
              <div role="alert" className="rounded-lg border border-erro/40 bg-erro-suave p-3 font-medium text-erro">
                {erroGeral}
              </div>
            )}

            <CampoTexto
              id="email"
              rotulo="E-mail"
              type="email"
              autoComplete="email"
              inputMode="email"
              icone={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              erro={erros.email}
            />

            <div className="relative">
              <CampoTexto
                id="senha"
                rotulo="Senha"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password"
                icone={Lock}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                erro={erros.senha}
                espacoDireita
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={mostrarSenha}
                className="absolute right-1 top-7 inline-flex size-10 items-center justify-center rounded-full text-tinta-suave hover:text-tinta"
              >
                {mostrarSenha ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
              </button>
            </div>

            <Botao id="botao-entrar" type="submit" variante="acento" tamanho="lg" className="mt-1 w-full">
              Entrar
            </Botao>
          </form>

          <p className="mt-5 flex items-center gap-3 text-sm font-medium text-tinta-suave" aria-hidden="true">
            <span className="h-px flex-1 bg-linha" />
            ou continue com
            <span className="h-px flex-1 bg-linha" />
          </p>
          <div className="mt-4">
            <EntradaSocial tipo={tipo} aoErro={setErroGeral} compacto />
          </div>

          {tipo === 'atleta' ? (
            <p className="mt-6 text-center text-tinta-suave">
              Novo por aqui?{' '}
              <Link to="/cadastro" className="font-semibold text-realce underline underline-offset-4 hover:no-underline">
                Criar conta de atleta
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-center text-tinta-suave">As contas da equipe são criadas pela coordenação da academia.</p>
          )}
        </div>

        <section aria-labelledby="titulo-demo" className="mt-6 rounded-xl border border-white/12 bg-white/5 p-4">
          <h2 id="titulo-demo" className="text-base font-semibold text-white">Contas de demonstração</h2>
          <p className="mt-1 text-sm text-white/75">Toque em uma para preencher. Senha de todas: {SENHA_DEMONSTRACAO}.</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {CONTAS_DEMONSTRACAO.map((conta) => (
              <li key={conta.email}>
                <button
                  type="button"
                  onClick={() => usarConta(conta)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/25 px-3.5 text-sm font-medium text-white hover:bg-white/10"
                >
                  {conta.rotulo}
                  <span className="text-white/70">{conta.descricao.split(',')[0]}</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={restaurar} className="mt-3 inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-white/75 underline-offset-4 hover:text-white hover:underline">
            <RotateCcw aria-hidden="true" className="size-4" />
            Restaurar dados de exemplo
          </button>
        </section>
      </main>
    </div>
  );
}
