/*
 * Desempenho do atleta: atributos (estilo cartão de jogador), nota de treino,
 * montagem de times e estatísticas de jogo.
 * Também é espelhado no script Python de CTWP.
 */
import type {
  Atleta, Categoria, EstatisticaJogo, Falha, Jogo, Notas, Posicao, RegistroTreino, StatTreino, Treino,
} from '../tipos';

/* ---------- Atributos e overall ---------- */

export type Atributo = 'ataque' | 'defesa' | 'forca' | 'habilidade' | 'chute' | 'elasticidade' | 'posicionamento';
export type Atributos = Record<Atributo, number>;

export interface DescricaoAtributo {
  id: Atributo;
  nome: string;
  sigla: string;
}

/** Atributos do cartão dos jogadores de linha. */
export const ATRIBUTOS_LINHA: DescricaoAtributo[] = [
  { id: 'ataque', nome: 'Ataque', sigla: 'ATA' },
  { id: 'defesa', nome: 'Defesa', sigla: 'DEF' },
  { id: 'forca', nome: 'Força', sigla: 'FOR' },
  { id: 'habilidade', nome: 'Habilidade', sigla: 'HAB' },
];

/** Atributos do cartão do goleiro. */
export const ATRIBUTOS_GOLEIRO: DescricaoAtributo[] = [
  { id: 'chute', nome: 'Chute', sigla: 'CHU' },
  { id: 'elasticidade', nome: 'Elasticidade', sigla: 'ELA' },
  { id: 'posicionamento', nome: 'Posicionamento', sigla: 'POS' },
];

export function atributosDaPosicao(posicao: Posicao): DescricaoAtributo[] {
  return posicao === 'Goleiro' ? ATRIBUTOS_GOLEIRO : ATRIBUTOS_LINHA;
}

/**
 * Todo jogador novo começa com estes valores. Só a nota do treinador muda os atributos.
 * Linha: ataque 55, defesa 45, força 45, habilidade 55. Goleiro: chute 45, elasticidade 55, posicionamento 50.
 */
export const ATRIBUTOS_INICIAIS: Atributos = {
  ataque: 55, defesa: 45, forca: 45, habilidade: 55,
  chute: 45, elasticidade: 55, posicionamento: 50,
};
const MINIMO = 30;
const MAXIMO = 99;

/** Peso de cada atributo no overall, por posição. */
const PESOS: Record<Posicao, Partial<Atributos>> = {
  Atacante: { ataque: 0.45, habilidade: 0.3, forca: 0.15, defesa: 0.1 },
  Meia: { habilidade: 0.4, ataque: 0.3, defesa: 0.15, forca: 0.15 },
  Volante: { defesa: 0.4, habilidade: 0.25, forca: 0.25, ataque: 0.1 },
  Zagueiro: { defesa: 0.5, forca: 0.3, habilidade: 0.1, ataque: 0.1 },
  Lateral: { defesa: 0.3, habilidade: 0.3, forca: 0.2, ataque: 0.2 },
  Goleiro: { elasticidade: 0.45, posicionamento: 0.4, chute: 0.15 },
};

export const SIGLA_POSICAO: Record<Posicao, string> = {
  Goleiro: 'GOL', Zagueiro: 'ZAG', Lateral: 'LAT', Volante: 'VOL', Meia: 'MEI', Atacante: 'ATA',
};

export function calcularOverall(atributos: Atributos, posicao: Posicao): number {
  const pesos = PESOS[posicao];
  const total = (Object.keys(pesos) as Atributo[]).reduce((soma, a) => soma + atributos[a] * (pesos[a] ?? 0), 0);
  return Math.round(total);
}

export type FaixaCartao = 'base' | 'destaque' | 'elite';

export function faixaDoCartao(overall: number): FaixaCartao {
  if (overall >= 75) return 'elite';
  if (overall >= 60) return 'destaque';
  return 'base';
}

const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const arredondar = (v: number) => Math.round(v * 10) / 10;

/* ---------- Estatísticas e nota de treino (estilo Sofascore) ---------- */

export const STATS: Record<StatTreino, { nome: string; singular: string; peso: number }> = {
  gols: { nome: 'Gols', singular: 'Gol', peso: 1 },
  assistencias: { nome: 'Assistências', singular: 'Assistência', peso: 0.7 },
  finalizacoes: { nome: 'Finalizações no alvo', singular: 'Finalização no alvo', peso: 0.2 },
  passesDecisivos: { nome: 'Passes decisivos', singular: 'Passe decisivo', peso: 0.3 },
  dribles: { nome: 'Dribles certos', singular: 'Drible certo', peso: 0.15 },
  desarmes: { nome: 'Desarmes', singular: 'Desarme', peso: 0.3 },
  interceptacoes: { nome: 'Interceptações', singular: 'Interceptação', peso: 0.25 },
  defesas: { nome: 'Defesas', singular: 'Defesa', peso: 0.4 },
  golsSofridos: { nome: 'Gols sofridos', singular: 'Gol sofrido', peso: -0.3 },
  perdas: { nome: 'Perdas de bola', singular: 'Perda de bola', peso: -0.15 },
};

/** As 4 estatísticas mais importantes de cada posição aparecem primeiro na avaliação rápida. */
export const STATS_POR_POSICAO: Record<Posicao, StatTreino[]> = {
  Goleiro: ['defesas', 'golsSofridos', 'interceptacoes', 'perdas'],
  Zagueiro: ['desarmes', 'interceptacoes', 'gols', 'perdas'],
  Lateral: ['desarmes', 'assistencias', 'passesDecisivos', 'perdas'],
  Volante: ['desarmes', 'interceptacoes', 'passesDecisivos', 'perdas'],
  Meia: ['assistencias', 'passesDecisivos', 'gols', 'perdas'],
  Atacante: ['gols', 'finalizacoes', 'assistencias', 'perdas'],
};

/** Cada ponto a melhorar desconta do atributo ligado a ele (um para a linha, outro para o goleiro). */
export const FALHAS: Record<Falha, { nome: string; atributo: Atributo; atributoGoleiro: Atributo }> = {
  passe: { nome: 'Passe', atributo: 'habilidade', atributoGoleiro: 'chute' },
  finalizacao: { nome: 'Finalização', atributo: 'ataque', atributoGoleiro: 'chute' },
  marcacao: { nome: 'Marcação', atributo: 'defesa', atributoGoleiro: 'posicionamento' },
  posicionamento: { nome: 'Posicionamento', atributo: 'defesa', atributoGoleiro: 'posicionamento' },
  intensidade: { nome: 'Intensidade', atributo: 'forca', atributoGoleiro: 'elasticidade' },
  decisao: { nome: 'Tomada de decisão', atributo: 'habilidade', atributoGoleiro: 'posicionamento' },
};

export const NOTA_BASE_TREINO = 6.5;
const PENALIDADE_FALHA = 0.3;

export function calcularNotaTreino(r: Pick<RegistroTreino, 'stats' | 'falhas' | 'ajuste'>): number {
  const pelasStats = (Object.entries(r.stats) as [StatTreino, number][]).reduce(
    (soma, [stat, qtd]) => soma + STATS[stat].peso * qtd,
    0,
  );
  const nota = NOTA_BASE_TREINO + pelasStats - r.falhas.length * PENALIDADE_FALHA + r.ajuste;
  return arredondar(limitar(nota, 3, 10));
}

export type FaixaNota = 'elite' | 'otima' | 'boa' | 'regular' | 'ruim';

export function faixaDaNota(nota: number): FaixaNota {
  if (nota >= 8) return 'elite';
  if (nota >= 7) return 'otima';
  if (nota >= 6.5) return 'boa';
  if (nota >= 6) return 'regular';
  return 'ruim';
}

export const TREINO_BOM = 6.5;

/* ---------- Como as notas do treinador mudam os atributos ---------- */

function somarLimitado(atual: Atributos, delta: Atributos, limitePorEvento: number): Atributos {
  const novo = { ...atual };
  for (const a of Object.keys(delta) as Atributo[]) {
    novo[a] = arredondar(limitar(atual[a] + limitar(delta[a], -limitePorEvento, limitePorEvento), MINIMO, MAXIMO));
  }
  return novo;
}

export function aplicarTreino(atual: Atributos, r: RegistroTreino, posicao: Posicao): Atributos {
  const s = (k: StatTreino) => r.stats[k] ?? 0;
  const geral = (calcularNotaTreino(r) - NOTA_BASE_TREINO) * 0.15;
  const delta: Atributos = {
    ataque: geral + 0.6 * s('gols') + 0.3 * s('assistencias') + 0.15 * s('finalizacoes'),
    habilidade: geral + 0.3 * s('assistencias') + 0.25 * s('passesDecisivos') + 0.2 * s('dribles') - 0.15 * s('perdas'),
    defesa: geral + 0.3 * s('desarmes') + 0.25 * s('interceptacoes') + 0.35 * s('defesas') - 0.2 * s('golsSofridos'),
    forca: geral + 0.1 * s('desarmes'),
    // Goleiro: defesas contam para a elasticidade; saídas e gols sofridos, para o posicionamento; passes, para o chute
    chute: geral + 0.25 * s('passesDecisivos') - 0.15 * s('perdas'),
    elasticidade: geral + 0.35 * s('defesas'),
    posicionamento: geral + 0.25 * s('interceptacoes') - 0.25 * s('golsSofridos'),
  };
  for (const f of r.falhas) delta[posicao === 'Goleiro' ? FALHAS[f].atributoGoleiro : FALHAS[f].atributo] -= 0.5;
  return somarLimitado(atual, delta, 2);
}

/** A avaliação técnica periódica (0 a 10 por critério) puxa cada atributo em direção à nota dada. */
export function aplicarAvaliacao(atual: Atributos, notas: Notas): Atributos {
  const alvo: Atributos = {
    ataque: ((notas.finalizacao + notas.velocidade) / 2) * 10,
    defesa: notas.posicionamento * 10,
    forca: notas.fisico * 10,
    habilidade: ((notas.passe + notas.drible) / 2) * 10,
    chute: ((notas.passe + notas.finalizacao) / 2) * 10,
    elasticidade: ((notas.fisico + notas.velocidade) / 2) * 10,
    posicionamento: notas.posicionamento * 10,
  };
  const delta = {} as Atributos;
  for (const a of Object.keys(alvo) as Atributo[]) delta[a] = (alvo[a] - atual[a]) * 0.25;
  return somarLimitado(atual, delta, 5);
}

export interface PontoHistorico {
  data: string;
  atributos: Atributos;
  overall: number;
}

/** Recalcula os atributos a partir do histórico de avaliações e treinos, em ordem de data. */
export function historicoAtributos(atleta: Atleta, treinos: Treino[]): PontoHistorico[] {
  type Evento = { data: string; ordem: number; aplicar: (a: Atributos) => Atributos };
  const eventos: Evento[] = [
    ...atleta.avaliacoes.map((av) => ({ data: av.data, ordem: 0, aplicar: (a: Atributos) => aplicarAvaliacao(a, av.notas) })),
    ...treinos.flatMap((t) =>
      t.registros
        .filter((r) => r.atletaId === atleta.id)
        .map((r) => ({ data: t.data, ordem: 1, aplicar: (a: Atributos) => aplicarTreino(a, r, atleta.posicao) })),
    ),
  ].sort((x, y) => x.data.localeCompare(y.data) || x.ordem - y.ordem);

  let atual = { ...ATRIBUTOS_INICIAIS };
  const pontos: PontoHistorico[] = [];
  for (const e of eventos) {
    atual = e.aplicar(atual);
    pontos.push({ data: e.data, atributos: atual, overall: calcularOverall(atual, atleta.posicao) });
  }
  return pontos;
}

export function atributosAtuais(atleta: Atleta, treinos: Treino[]): Atributos {
  return historicoAtributos(atleta, treinos).at(-1)?.atributos ?? { ...ATRIBUTOS_INICIAIS };
}

export function overallAtual(atleta: Atleta, treinos: Treino[]): number {
  return calcularOverall(atributosAtuais(atleta, treinos), atleta.posicao);
}

/* ---------- Histórico de treinos do atleta ---------- */

export interface TreinoDoAtleta {
  treino: Treino;
  registro: RegistroTreino;
  nota: number;
}

export function treinosDoAtleta(atletaId: string, treinos: Treino[]): TreinoDoAtleta[] {
  return treinos
    .flatMap((t) => t.registros.filter((r) => r.atletaId === atletaId).map((r) => ({ treino: t, registro: r, nota: calcularNotaTreino(r) })))
    .sort((a, b) => a.treino.data.localeCompare(b.treino.data));
}

/** Pontos a melhorar: as falhas mais marcadas pelo treinador nos últimos treinos. */
export function falhasFrequentes(historico: TreinoDoAtleta[], ultimos = 10): { falha: Falha; vezes: number }[] {
  const contagem = new Map<Falha, number>();
  for (const { registro } of historico.slice(-ultimos)) {
    for (const f of registro.falhas) contagem.set(f, (contagem.get(f) ?? 0) + 1);
  }
  return [...contagem.entries()].map(([falha, vezes]) => ({ falha, vezes })).sort((a, b) => b.vezes - a.vezes);
}

/* ---------- Montagem de times equilibrados ---------- */

export type Setor = 'GOL' | 'DEF' | 'MEI' | 'ATA';

export const SETOR_DA_POSICAO: Record<Posicao, Setor> = {
  Goleiro: 'GOL', Zagueiro: 'DEF', Lateral: 'DEF', Volante: 'MEI', Meia: 'MEI', Atacante: 'ATA',
};

export const NOME_SETOR: Record<Setor, string> = { GOL: 'Goleiros', DEF: 'Defesa', MEI: 'Meio-campo', ATA: 'Ataque' };

export interface JogadorEscalavel {
  id: string;
  posicao: Posicao;
  overall: number;
}

/**
 * Distribui os jogadores setor por setor (goleiros, defesa, meio, ataque).
 * Em cada setor, o melhor disponível vai para o time com menos jogadores daquele setor
 * e, no empate, para o time mais fraco no total. Assim os times ficam mesclados por posição e por nota.
 * `semente` embaralha jogadores de nota parecida para gerar outra combinação equilibrada.
 */
export function montarTimes(jogadores: JogadorEscalavel[], quantidade: number, semente = 0): string[][] {
  const times: { ids: string[]; total: number; porSetor: Record<Setor, number> }[] = Array.from({ length: quantidade }, () => ({
    ids: [], total: 0, porSetor: { GOL: 0, DEF: 0, MEI: 0, ATA: 0 },
  }));
  const ruido = (id: string) => {
    let h = semente * 2654435761;
    for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return ((h >>> 0) % 1000) / 1000;
  };
  for (const setor of ['GOL', 'DEF', 'MEI', 'ATA'] as Setor[]) {
    const doSetor = jogadores
      .filter((j) => SETOR_DA_POSICAO[j.posicao] === setor)
      .sort((a, b) => b.overall + (semente ? ruido(b.id) * 4 : 0) - (a.overall + (semente ? ruido(a.id) * 4 : 0)));
    for (const j of doSetor) {
      const destino = [...times].sort((a, b) => a.porSetor[setor] - b.porSetor[setor] || a.total - b.total || a.ids.length - b.ids.length)[0];
      destino.ids.push(j.id);
      destino.total += j.overall;
      destino.porSetor[setor] += 1;
    }
  }
  return times.map((t) => t.ids);
}

export function mediaOverall(ids: string[], overallDe: (id: string) => number): number {
  if (ids.length === 0) return 0;
  return Math.round((ids.reduce((s, id) => s + overallDe(id), 0) / ids.length) * 10) / 10;
}

/* ---------- Estatísticas de jogo ---------- */

export interface TotaisTemporada {
  jogos: number;
  gols: number;
  assistencias: number;
  desarmes: number;
  defesas: number;
}

export function totaisDoAtleta(atletaId: string, jogos: Jogo[]): TotaisTemporada {
  return jogos
    .flatMap((j) => j.estatisticas.filter((e) => e.atletaId === atletaId))
    .reduce<TotaisTemporada>(
      (t, e: EstatisticaJogo) => ({
        jogos: t.jogos + 1,
        gols: t.gols + e.gols,
        assistencias: t.assistencias + e.assistencias,
        desarmes: t.desarmes + e.desarmes,
        defesas: t.defesas + e.defesas,
      }),
      { jogos: 0, gols: 0, assistencias: 0, desarmes: 0, defesas: 0 },
    );
}

export function validarJogo(golsPro: number, estatisticas: EstatisticaJogo[]): string | null {
  const gols = estatisticas.reduce((s, e) => s + e.gols, 0);
  const assistencias = estatisticas.reduce((s, e) => s + e.assistencias, 0);
  if (gols > golsPro) return `Os jogadores somam ${gols} gols, mas o placar tem ${golsPro}. Corrija o placar ou os gols.`;
  if (assistencias > golsPro) return `Há ${assistencias} assistências para ${golsPro} gols. Cada gol tem no máximo uma assistência.`;
  return null;
}

export function atletasDaCategoria(atletas: Atleta[], categoria: Categoria, categoriaDe: (a: Atleta) => Categoria | null): Atleta[] {
  return atletas.filter((a) => a.status === 'academia' && categoriaDe(a) === categoria);
}
