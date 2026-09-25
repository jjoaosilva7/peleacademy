/*
 * Regras de negócio da Pelé Academia.
 * Este arquivo é o "contrato" que o script Python de CTWP espelha:
 * idade mínima, categorias, nota da peneira, carga de treino e tendência.
 */
import type {
  Atleta, Avaliacao, Categoria, CheckIn, Criterio, Inscricao, Notas, Peneira, PeDominante, Posicao,
} from '../tipos';
import { diasEntre, hojeISO, somarDias } from './datas';

export const IDADE_MINIMA = 7;
export const IDADE_MAXIMA = 20;
export const MAIORIDADE = 18;
export const NOTA_APROVACAO = 7;

export const POSICOES: Posicao[] = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Atacante'];
export const PES: PeDominante[] = ['Direito', 'Esquerdo', 'Ambos'];
export const CATEGORIAS: Categoria[] = ['Sub-11 Futsal', 'Sub-13 Futsal', 'Sub-15', 'Sub-17', 'Sub-20'];
export const UFS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA',
  'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

export const CRITERIOS: { id: Criterio; nome: string }[] = [
  { id: 'velocidade', nome: 'Velocidade' },
  { id: 'passe', nome: 'Passe' },
  { id: 'drible', nome: 'Drible' },
  { id: 'finalizacao', nome: 'Finalização' },
  { id: 'posicionamento', nome: 'Posicionamento' },
  { id: 'fisico', nome: 'Físico' },
];

/* ---------- Idade e categoria ---------- */

export function calcularIdade(nascimento: string, hoje = hojeISO()): number {
  const [anoN, mesN, diaN] = nascimento.split('-').map(Number);
  const [anoH, mesH, diaH] = hoje.split('-').map(Number);
  let idade = anoH - anoN;
  if (mesH < mesN || (mesH === mesN && diaH < diaN)) idade -= 1;
  return idade;
}

export function categoriaPorIdade(idade: number): Categoria | null {
  if (idade < IDADE_MINIMA || idade > IDADE_MAXIMA) return null;
  if (idade <= 11) return 'Sub-11 Futsal';
  if (idade <= 13) return 'Sub-13 Futsal';
  if (idade <= 15) return 'Sub-15';
  if (idade <= 17) return 'Sub-17';
  return 'Sub-20';
}

export function categoriaDoAtleta(atleta: Atleta, hoje = hojeISO()): Categoria | null {
  return categoriaPorIdade(calcularIdade(atleta.nascimento, hoje));
}

/* ---------- Peneiras ---------- */

export function vagasRestantes(peneira: Peneira, inscricoes: Inscricao[]): number {
  const ocupadas = inscricoes.filter((i) => i.peneiraId === peneira.id).length;
  return Math.max(peneira.vagas - ocupadas, 0);
}

export function verificarInscricao(
  atleta: Atleta,
  peneira: Peneira,
  inscricoes: Inscricao[],
  hoje = hojeISO(),
): { permitido: boolean; motivo?: string } {
  if (inscricoes.some((i) => i.peneiraId === peneira.id && i.atletaId === atleta.id)) {
    return { permitido: false, motivo: 'Você já está inscrito nesta peneira.' };
  }
  if (peneira.data < hoje) {
    return { permitido: false, motivo: 'As inscrições desta peneira já encerraram.' };
  }
  const categoria = categoriaDoAtleta(atleta, hoje);
  if (categoria !== peneira.categoria) {
    return {
      permitido: false,
      motivo: `Esta peneira é para a categoria ${peneira.categoria}. A sua é ${categoria ?? 'indefinida'}.`,
    };
  }
  if (vagasRestantes(peneira, inscricoes) === 0) {
    return { permitido: false, motivo: 'Não há mais vagas nesta peneira.' };
  }
  return { permitido: true };
}

/* ---------- Avaliação técnica ---------- */

export function calcularNotaFinal(notas: Notas): number {
  const valores = CRITERIOS.map((c) => notas[c.id]);
  const media = valores.reduce((soma, v) => soma + v, 0) / valores.length;
  return Math.round(media * 10) / 10;
}

export function sugerirDecisao(nota: number): { texto: string; tom: 'sucesso' | 'atencao' | 'erro' } {
  if (nota >= NOTA_APROVACAO) return { texto: 'Recomendado aprovar', tom: 'sucesso' };
  if (nota >= 6) return { texto: 'Avaliar em nova peneira', tom: 'atencao' };
  return { texto: 'Não recomendado', tom: 'erro' };
}

export function ordenarAvaliacoes(avaliacoes: Avaliacao[]): Avaliacao[] {
  return [...avaliacoes].sort((a, b) => a.data.localeCompare(b.data));
}

export type TipoTendencia = 'evolucao' | 'estavel' | 'atencao' | 'sem-dados';

export const ROTULO_TENDENCIA: Record<TipoTendencia, string> = {
  evolucao: 'Em evolução',
  estavel: 'Estável',
  atencao: 'Em atenção',
  'sem-dados': 'Sem dados suficientes',
};

/**
 * Tendência = taxa de variação média da nota nas últimas 3 avaliações
 * (a "derivada" discreta usada em DPS).
 */
export function calcularTendencia(avaliacoes: Avaliacao[]): { tipo: TipoTendencia; variacao: number } {
  const ultimas = ordenarAvaliacoes(avaliacoes).slice(-3);
  if (ultimas.length < 2) return { tipo: 'sem-dados', variacao: 0 };
  const primeira = calcularNotaFinal(ultimas[0].notas);
  const ultima = calcularNotaFinal(ultimas[ultimas.length - 1].notas);
  const variacao = Math.round(((ultima - primeira) / (ultimas.length - 1)) * 100) / 100;
  if (variacao >= 0.3) return { tipo: 'evolucao', variacao };
  if (variacao <= -0.3) return { tipo: 'atencao', variacao };
  return { tipo: 'estavel', variacao };
}

/* ---------- Check-in: bem-estar e carga ---------- */

export function indiceBemEstar(c: Pick<CheckIn, 'sono' | 'dor' | 'cansaco' | 'estresse'>): number {
  return c.sono + c.dor + c.cansaco + c.estresse;
}

export type NivelBemEstar = 'bom' | 'atencao' | 'baixo';

export const ROTULO_BEM_ESTAR: Record<NivelBemEstar, string> = {
  bom: 'Bem-estar bom',
  atencao: 'Bem-estar em atenção',
  baixo: 'Bem-estar baixo',
};

export function classificarBemEstar(indice: number): NivelBemEstar {
  if (indice >= 14) return 'bom';
  if (indice >= 10) return 'atencao';
  return 'baixo';
}

/** Carga interna do treino (método sRPE): esforço x minutos, em unidades arbitrárias (UA). */
export function cargaDoTreino(c: Pick<CheckIn, 'esforco' | 'minutos'>): number {
  return c.esforco * c.minutos;
}

/** Soma da carga nos `dias` que terminam em `fim` (inclusive). É a "integral" usada em DPS. */
export function cargaNoPeriodo(checkins: CheckIn[], fim: string, dias: number): number {
  const inicio = somarDias(fim, -(dias - 1));
  return checkins
    .filter((c) => c.data >= inicio && c.data <= fim)
    .reduce((soma, c) => soma + cargaDoTreino(c), 0);
}

/** Razão entre a carga dos últimos 7 dias e a média semanal dos últimos 28 dias. */
export function razaoDeCarga(checkins: CheckIn[], hoje = hojeISO()): number | null {
  const aguda = cargaNoPeriodo(checkins, hoje, 7);
  const cronica = cargaNoPeriodo(checkins, hoje, 28) / 4;
  if (cronica === 0) return null;
  return Math.round((aguda / cronica) * 100) / 100;
}

export function classificarRazao(razao: number | null): 'alta' | 'ideal' | 'baixa' | 'sem-dados' {
  if (razao === null) return 'sem-dados';
  if (razao > 1.5) return 'alta';
  if (razao < 0.8) return 'baixa';
  return 'ideal';
}

export function checkinDoDia(atleta: Atleta, dia = hojeISO()): CheckIn | undefined {
  return atleta.checkins.find((c) => c.data === dia);
}

export function ultimosCheckins(atleta: Atleta, quantidade: number): CheckIn[] {
  return [...atleta.checkins].sort((a, b) => a.data.localeCompare(b.data)).slice(-quantidade);
}

/* ---------- Alertas para a comissão técnica ---------- */

export function listarAlertas(atleta: Atleta, hoje = hojeISO()): string[] {
  if (atleta.status !== 'academia') return [];
  const alertas: string[] = [];
  const recentes = ultimosCheckins(atleta, 3);
  const ultimo = recentes[recentes.length - 1];

  if (ultimo && diasEntre(ultimo.data, hoje) <= 1 && classificarBemEstar(indiceBemEstar(ultimo)) === 'baixo') {
    alertas.push('Bem-estar baixo no último check-in');
  } else if (
    recentes.length === 3 &&
    recentes.every((c) => classificarBemEstar(indiceBemEstar(c)) !== 'bom')
  ) {
    alertas.push('Bem-estar abaixo do ideal há 3 check-ins');
  }
  if (classificarRazao(razaoDeCarga(atleta.checkins, hoje)) === 'alta') {
    alertas.push('Carga da semana muito acima da média');
  }
  if (calcularTendencia(atleta.avaliacoes).tipo === 'atencao') {
    alertas.push('Queda de desempenho nas avaliações');
  }
  if (!ultimo || diasEntre(ultimo.data, hoje) >= 3) {
    alertas.push('Sem check-in há 3 dias ou mais');
  }
  return alertas;
}

/* ---------- Validações de formulário ---------- */

export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function validarSenha(senha: string): string | null {
  if (senha.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) return 'Use letras e números na senha.';
  return null;
}

export function somenteDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

export const NACIONALIDADES = ['Brasil', 'Argentina', 'Uruguai', 'Paraguai', 'Portugal', 'Outro'] as const;

export interface DadosCadastro {
  nome: string;
  apelido: string;
  nacionalidade: string;
  nascimento: string;
  cidade: string;
  uf: string;
  posicao: string;
  pe: string;
  altura: string;
  peso: string;
  responsavelNome: string;
  responsavelEmail: string;
  responsavelTelefone: string;
  consentimento: boolean;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export function validarApelido(apelido: string): string | null {
  const limpo = apelido.trim();
  if (limpo.length > 16) return 'Use um apelido com até 16 caracteres.';
  if (limpo && !/^[\p{L}\p{N} .'-]+$/u.test(limpo)) return 'Use só letras, números, espaço, ponto ou hífen.';
  return null;
}

export type ErrosCadastro = Partial<Record<keyof DadosCadastro, string>>;

export function precisaDeResponsavel(nascimento: string, hoje = hojeISO()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(nascimento)) return false;
  return calcularIdade(nascimento, hoje) < MAIORIDADE;
}

export function validarCadastro(d: DadosCadastro, emailsExistentes: string[], hoje = hojeISO()): ErrosCadastro {
  const erros: ErrosCadastro = {};
  const nome = d.nome.trim();

  if (!nome) erros.nome = 'Informe seu nome completo.';
  else if (nome.split(/\s+/).length < 2) erros.nome = 'Informe nome e sobrenome.';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.nascimento)) {
    erros.nascimento = 'Informe sua data de nascimento.';
  } else if (d.nascimento > hoje) {
    erros.nascimento = 'A data de nascimento não pode estar no futuro.';
  } else {
    const idade = calcularIdade(d.nascimento, hoje);
    if (idade < IDADE_MINIMA) erros.nascimento = `A Pelé Academia recebe atletas a partir de ${IDADE_MINIMA} anos.`;
    else if (idade > IDADE_MAXIMA) erros.nascimento = `A Pelé Academia recebe atletas de até ${IDADE_MAXIMA} anos.`;
  }

  if (d.apelido.trim().length > 16) erros.apelido = 'Use um apelido com até 16 caracteres.';
  if (!d.cidade.trim()) erros.cidade = 'Informe sua cidade.';
  if (!d.uf) erros.uf = 'Selecione o estado.';
  if (!d.posicao) erros.posicao = 'Selecione sua posição.';
  if (!d.pe) erros.pe = 'Selecione o pé dominante.';

  if (d.altura) {
    const altura = Number(d.altura);
    if (!Number.isFinite(altura) || altura < 100 || altura > 220) {
      erros.altura = 'Informe a altura em centímetros, entre 100 e 220.';
    }
  }
  if (d.peso) {
    const peso = Number(d.peso);
    if (!Number.isFinite(peso) || peso < 20 || peso > 150) {
      erros.peso = 'Informe o peso em quilos, entre 20 e 150.';
    }
  }

  if (!erros.nascimento && precisaDeResponsavel(d.nascimento, hoje)) {
    const nomeResp = d.responsavelNome.trim();
    if (!nomeResp) erros.responsavelNome = 'Informe o nome do responsável.';
    else if (nomeResp.split(/\s+/).length < 2) erros.responsavelNome = 'Informe nome e sobrenome do responsável.';
    if (!validarEmail(d.responsavelEmail)) erros.responsavelEmail = 'Informe um e-mail válido, como nome@exemplo.com.';
    const tel = somenteDigitos(d.responsavelTelefone);
    if (tel.length < 10 || tel.length > 11) erros.responsavelTelefone = 'Informe o telefone com DDD (10 ou 11 dígitos).';
    if (!d.consentimento) erros.consentimento = 'Atletas menores de 18 anos precisam da autorização do responsável.';
  }

  if (!validarEmail(d.email)) {
    erros.email = 'Informe um e-mail válido, como nome@exemplo.com.';
  } else if (emailsExistentes.includes(d.email.trim().toLowerCase())) {
    erros.email = 'Este e-mail já está cadastrado. Tente entrar com ele.';
  }

  const erroSenha = validarSenha(d.senha);
  if (erroSenha) erros.senha = erroSenha;
  if (!d.confirmarSenha) erros.confirmarSenha = 'Repita a senha.';
  else if (d.confirmarSenha !== d.senha) erros.confirmarSenha = 'As senhas não são iguais.';

  return erros;
}
