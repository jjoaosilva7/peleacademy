/*
 * Dados de exemplo do MVP. Tudo é fictício e gerado a partir da data de hoje,
 * para que gráficos, alertas e notas sempre pareçam atuais durante a demonstração.
 */
import type {
  Atleta, Avaliacao, BancoDados, CheckIn, Criterio, EstatisticaJogo, Falha, Inscricao, Jogo, Nacionalidade,
  Notas, Peneira, PeDominante, Posicao, RegistroTreino, StatTreino, Tag, Treino, Usuario,
} from '../tipos';
import { deISO, hojeISO, somarDias } from '../lib/datas';
import { categoriaPorIdade, CRITERIOS } from '../lib/regras';
import { STATS_POR_POSICAO } from '../lib/desempenho';

export const SENHA_DEMONSTRACAO = 'pele2026';

/** Aumente quando a estrutura dos dados mudar: o app troca os dados antigos pelo exemplo novo. */
export const VERSAO_DADOS = 3;

export const CONTAS_DEMONSTRACAO = [
  { rotulo: 'Candidato', descricao: 'Kauã, aguardando resultado de peneira', tipo: 'atleta' as const, email: 'kaua@exemplo.com' },
  { rotulo: 'Atleta da academia', descricao: 'João, camisa 10 do Sub-17', tipo: 'atleta' as const, email: 'joao@exemplo.com' },
  { rotulo: 'Atleta em alerta', descricao: 'Lucas, 3 treinos ruins seguidos', tipo: 'atleta' as const, email: 'lucas@exemplo.com' },
  { rotulo: 'Técnica e olheira', descricao: 'Carla, equipe técnica', tipo: 'equipe' as const, email: 'tecnico@peleacademia.com.br' },
];

/** Gerador pseudoaleatório com semente: os dados saem iguais a cada carregamento. */
function criarSorteio(semente: number) {
  let s = semente;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const meioPonto = (v: number) => Math.round(v * 2) / 2;

interface Modelo {
  id: string;
  nome: string;
  apelido?: string;
  idade: number;
  posicao: Posicao;
  pe: PeDominante;
  cidade: string;
  uf: string;
  nacionalidade?: Nacionalidade;
  alturaCm: number;
  pesoKg: number;
  numero?: number;
  base?: Partial<Record<Criterio, number>>;
  ritmo?: number;
  perfil?: 'queda' | 'estresse';
  cargaAlta?: boolean;
  responsavel?: string;
  tags: string[];
}

const ACADEMIA: Modelo[] = [
  { id: 'a-joao', nome: 'João Silva', apelido: 'Joãozinho', idade: 17, posicao: 'Meia', pe: 'Direito', cidade: 'Resende', uf: 'RJ', alturaCm: 178, pesoKg: 68, numero: 10, base: { passe: 8.5, drible: 8.5, finalizacao: 8, velocidade: 7.5, posicionamento: 7, fisico: 7 }, ritmo: 0.3, responsavel: 'Ana Silva', tags: ['Visão de jogo', 'Passe em profundidade', 'Drible curto'] },
  { id: 'a-lucas', nome: 'Lucas Ferreira', apelido: 'Lukinha', idade: 16, posicao: 'Atacante', pe: 'Esquerdo', cidade: 'Rio de Janeiro', uf: 'RJ', alturaCm: 181, pesoKg: 72, numero: 9, base: { finalizacao: 8, velocidade: 8 }, ritmo: 0.1, perfil: 'queda', cargaAlta: true, responsavel: 'Sérgio Ferreira', tags: ['Boa finalização', 'Arranque', 'Jogo aéreo'] },
  { id: 'a-rafael', nome: 'Rafael Costa', apelido: 'Rafa', idade: 17, posicao: 'Zagueiro', pe: 'Direito', cidade: 'Barra Mansa', uf: 'RJ', alturaCm: 184, pesoKg: 77, numero: 4, base: { fisico: 8, posicionamento: 7.5 }, ritmo: -0.4, perfil: 'estresse', responsavel: 'Marcos Costa', tags: ['Desarme', 'Jogo aéreo'] },
  { id: 'a-bruno', nome: 'Bruno Lima', apelido: 'Brunão', idade: 16, posicao: 'Volante', pe: 'Ambos', cidade: 'São Paulo', uf: 'SP', alturaCm: 175, pesoKg: 70, numero: 5, base: { passe: 7.5, posicionamento: 7.5 }, ritmo: 0.25, responsavel: 'Cláudia Lima', tags: ['Marcação', 'Passe longo'] },
  { id: 'a-thiago', nome: 'Thiago Nunes', apelido: 'Paredão', idade: 16, posicao: 'Goleiro', pe: 'Direito', cidade: 'Petrópolis', uf: 'RJ', alturaCm: 188, pesoKg: 78, numero: 1, base: { posicionamento: 8, fisico: 7.5 }, ritmo: 0.2, responsavel: 'Renato Nunes', tags: ['Reflexo', 'Saída do gol'] },
  { id: 'a-vitor', nome: 'Vitor Hugo Andrade', idade: 17, posicao: 'Goleiro', pe: 'Direito', cidade: 'Volta Redonda', uf: 'RJ', alturaCm: 185, pesoKg: 76, numero: 12, base: { posicionamento: 7 }, ritmo: 0.1, responsavel: 'Cristina Andrade', tags: ['Jogo com os pés'] },
  { id: 'a-caio', nome: 'Caio Mendonça', idade: 16, posicao: 'Zagueiro', pe: 'Esquerdo', cidade: 'Juiz de Fora', uf: 'MG', alturaCm: 183, pesoKg: 74, numero: 3, base: { posicionamento: 7, fisico: 7.5 }, ritmo: 0.2, responsavel: 'Paula Mendonça', tags: ['Antecipação'] },
  { id: 'a-felipe', nome: 'Felipe Araújo', apelido: 'Felipinho', idade: 16, posicao: 'Lateral', pe: 'Direito', cidade: 'Niterói', uf: 'RJ', alturaCm: 172, pesoKg: 64, numero: 2, base: { velocidade: 8 }, ritmo: 0.15, responsavel: 'Rosana Araújo', tags: ['Velocidade', 'Apoio ao ataque'] },
  { id: 'a-igor', nome: 'Igor Batista', idade: 17, posicao: 'Lateral', pe: 'Esquerdo', cidade: 'Campos dos Goytacazes', uf: 'RJ', alturaCm: 174, pesoKg: 67, numero: 6, base: { velocidade: 7.5, passe: 7 }, ritmo: 0.1, responsavel: 'Hélio Batista', tags: ['Cruzamento'] },
  { id: 'a-samuel', nome: 'Samuel Duarte', idade: 17, posicao: 'Volante', pe: 'Direito', cidade: 'Belo Horizonte', uf: 'MG', alturaCm: 179, pesoKg: 72, numero: 8, base: { fisico: 7.5, posicionamento: 7 }, ritmo: 0.05, responsavel: 'Tânia Duarte', tags: ['Desarme', 'Fôlego'] },
  { id: 'a-henrique', nome: 'Henrique Moraes', apelido: 'Rique', idade: 16, posicao: 'Meia', pe: 'Esquerdo', cidade: 'Taubaté', uf: 'SP', alturaCm: 170, pesoKg: 61, numero: 18, base: { drible: 7.5, passe: 7 }, ritmo: 0.35, responsavel: 'Lúcia Moraes', tags: ['Criatividade', 'Drible curto'] },
  { id: 'a-nicolas', nome: 'Nicolas Prado', idade: 17, posicao: 'Atacante', pe: 'Direito', cidade: 'Campinas', uf: 'SP', alturaCm: 180, pesoKg: 73, numero: 11, base: { finalizacao: 7.5, fisico: 7.5 }, ritmo: 0.1, responsavel: 'Adriana Prado', tags: ['Pivô', 'Jogo aéreo'] },
  { id: 'a-diego', nome: 'Diego Ramos', idade: 16, posicao: 'Atacante', pe: 'Esquerdo', cidade: 'Resende', uf: 'RJ', nacionalidade: 'Argentina', alturaCm: 173, pesoKg: 65, numero: 7, base: { velocidade: 8.5, drible: 7.5 }, ritmo: 0.25, responsavel: 'Silvia Ramos', tags: ['Velocidade', 'Um contra um'] },
  { id: 'a-otavio', nome: 'Otávio Leal', idade: 17, posicao: 'Atacante', pe: 'Direito', cidade: 'Itatiaia', uf: 'RJ', alturaCm: 177, pesoKg: 70, numero: 17, base: { finalizacao: 7 }, ritmo: 0, responsavel: 'Mário Leal', tags: ['Finalização de fora'] },
  { id: 'a-mateus', nome: 'Mateus Oliveira', idade: 15, posicao: 'Goleiro', pe: 'Direito', cidade: 'Volta Redonda', uf: 'RJ', alturaCm: 186, pesoKg: 74, numero: 21, base: { posicionamento: 8 }, ritmo: 0.1, responsavel: 'Patrícia Oliveira', tags: ['Reflexo'] },
  { id: 'a-gabriel', nome: 'Gabriel Souza', idade: 19, posicao: 'Lateral', pe: 'Esquerdo', cidade: 'Belo Horizonte', uf: 'MG', nacionalidade: 'Portugal', alturaCm: 174, pesoKg: 67, numero: 16, base: { velocidade: 8.5 }, ritmo: 0.05, tags: ['Cruzamento', 'Velocidade'] },
  { id: 'a-enzo', nome: 'Enzo Martins', apelido: 'Enzinho', idade: 12, posicao: 'Meia', pe: 'Direito', cidade: 'Resende', uf: 'RJ', alturaCm: 152, pesoKg: 41, numero: 20, base: { drible: 8 }, ritmo: 0.45, responsavel: 'Juliana Martins', tags: ['Drible curto', 'Criatividade'] },
];

const CANDIDATOS: Modelo[] = [
  { id: 'a-kaua', nome: 'Kauã Pereira', idade: 16, posicao: 'Meia', pe: 'Direito', cidade: 'Rio de Janeiro', uf: 'RJ', alturaCm: 172, pesoKg: 63, responsavel: 'Mariana Pereira', tags: ['Drible curto', 'Chute de fora'] },
  { id: 'a-miguel', nome: 'Miguel Rocha', idade: 17, posicao: 'Zagueiro', pe: 'Esquerdo', cidade: 'Juiz de Fora', uf: 'MG', alturaCm: 185, pesoKg: 76, responsavel: 'Renata Rocha', tags: ['Jogo aéreo'] },
  { id: 'a-pedro', nome: 'Pedro Henrique Dias', idade: 16, posicao: 'Lateral', pe: 'Direito', cidade: 'Campinas', uf: 'SP', alturaCm: 170, pesoKg: 62, responsavel: 'Fábio Dias', tags: ['Velocidade', 'Cruzamento'] },
  { id: 'a-arthur', nome: 'Arthur Almeida', idade: 14, posicao: 'Goleiro', pe: 'Direito', cidade: 'Niterói', uf: 'RJ', alturaCm: 176, pesoKg: 64, responsavel: 'Luciana Almeida', tags: ['Reflexo'] },
  { id: 'a-davi', nome: 'Davi Santos', idade: 15, posicao: 'Atacante', pe: 'Direito', cidade: 'Salvador', uf: 'BA', alturaCm: 169, pesoKg: 60, responsavel: 'Edna Santos', tags: ['Arranque'] },
];

function nascimentoPara(idade: number, hoje: string, ajuste: number) {
  return somarDias(hoje, -Math.round((idade + 0.2 + ajuste * 0.5) * 365.25));
}

function gerarNotas(sorteio: () => number, modelo: Modelo, passo: number): Notas {
  const notas = {} as Notas;
  for (const { id } of CRITERIOS) {
    const base = modelo.base?.[id] ?? 6.5;
    notas[id] = meioPonto(limitar(base + (modelo.ritmo ?? 0) * passo + (sorteio() - 0.5) * 0.8, 3, 10));
  }
  return notas;
}

function gerarAvaliacoes(sorteio: () => number, modelo: Modelo, hoje: string): Avaliacao[] {
  const observacoes = [
    'Boa leitura de jogo, precisa ganhar intensidade sem a bola.',
    'Evoluiu na tomada de decisão. Manter trabalho de força.',
    'Consistente nos treinos. Atenção à recomposição defensiva.',
    'Mostrou maturidade nos jogos da semana.',
  ];
  return [-150, -105, -60, -20].map((d, passo) => ({
    id: `av-${modelo.id}-${passo}`,
    data: somarDias(hoje, d),
    avaliador: passo % 2 === 0 ? 'Carla Mendes' : 'Rogério Alves',
    origem: 'academia',
    notas: gerarNotas(sorteio, modelo, passo),
    observacao: observacoes[passo],
  }));
}

function gerarCheckins(sorteio: () => number, modelo: Modelo, hoje: string): CheckIn[] {
  const lista: CheckIn[] = [];
  for (let d = 28; d >= 1; d--) {
    const data = somarDias(hoje, -d);
    const recente = d <= 3;
    const cargaAlta = Boolean(modelo.cargaAlta) && d <= 6;
    if (!cargaAlta && !recente && sorteio() < 0.12) continue;
    const escala = (campo: 'sono' | 'dor' | 'cansaco' | 'estresse') => {
      let base = 3.9;
      if (recente && modelo.perfil === 'queda') base = 1.8;
      if (recente && modelo.perfil === 'estresse' && (campo === 'sono' || campo === 'estresse')) base = 1.8;
      return limitar(Math.round(base + (sorteio() - 0.5) * 1.4), 1, 5);
    };
    lista.push({
      data,
      sono: escala('sono'),
      dor: escala('dor'),
      cansaco: escala('cansaco'),
      estresse: escala('estresse'),
      minutos: cargaAlta ? 120 + Math.round(sorteio() * 15) : 60 + Math.round(sorteio() * 6) * 5,
      esforco: cargaAlta ? 9 : 4 + Math.round(sorteio() * 3),
    });
  }
  return lista;
}

function montarTags(modelo: Modelo, votantes: string[], sorteio: () => number): Tag[] {
  return modelo.tags.map((nome, i) => ({
    id: `tag-${modelo.id}-${i}`,
    nome,
    votos: votantes.filter((v) => v !== `u-${modelo.id.slice(2)}` && sorteio() < 0.45),
  }));
}

/* ---------- Treinos com estatísticas ---------- */

const FAIXAS: Record<StatTreino, [number, number]> = {
  gols: [0, 2], assistencias: [0, 1], finalizacoes: [0, 2], passesDecisivos: [0, 2], dribles: [0, 2],
  desarmes: [0, 3], interceptacoes: [0, 2], defesas: [1, 4], golsSofridos: [0, 3], perdas: [0, 3],
};

const FALHAS_POR_POSICAO: Record<Posicao, Falha[]> = {
  Goleiro: ['posicionamento', 'decisao'],
  Zagueiro: ['marcacao', 'posicionamento', 'passe'],
  Lateral: ['marcacao', 'passe', 'intensidade'],
  Volante: ['passe', 'marcacao', 'decisao'],
  Meia: ['passe', 'decisao', 'intensidade'],
  Atacante: ['finalizacao', 'decisao', 'intensidade'],
};

function gerarRegistro(sorteio: () => number, modelo: Modelo, ruim: boolean): RegistroTreino {
  const stats: RegistroTreino['stats'] = {};
  for (const stat of STATS_POR_POSICAO[modelo.posicao]) {
    const [min, max] = FAIXAS[stat];
    let valor = min + Math.floor(sorteio() * (max - min + 1) * (stat === 'gols' ? 0.8 : 1));
    if (ruim) valor = stat === 'perdas' || stat === 'golsSofridos' ? max : min;
    if (valor > 0) stats[stat] = valor;
  }
  const opcoes = FALHAS_POR_POSICAO[modelo.posicao];
  const falhas: Falha[] = ruim
    ? modelo.perfil === 'queda' ? ['intensidade', 'finalizacao'] : ['marcacao', 'posicionamento']
    : opcoes.filter(() => sorteio() < 0.22);
  return { atletaId: modelo.id, stats, falhas, ajuste: ruim ? -0.5 : 0 };
}

function gerarTreinos(sorteio: () => number, elenco: Modelo[], hoje: string): Treino[] {
  const treinos: Treino[] = [];
  let recentes = 0;
  for (let d = 1; d <= 18; d++) {
    const data = somarDias(hoje, -d);
    if (deISO(data).getDay() === 0) continue;
    recentes += 1;
    treinos.push({
      id: `t-${data}`,
      data,
      categoria: 'Sub-17',
      avaliador: d % 2 === 0 ? 'Rogério Alves' : 'Carla Mendes',
      registros: elenco.map((m) => gerarRegistro(sorteio, m, Boolean(m.perfil) && recentes <= 3)),
    });
  }
  return treinos;
}

/* ---------- Jogos ---------- */

const ADVERSARIOS = ['Resende FC', 'EC Serra Verde', 'Atlético do Vale', 'Serrano FC'];

function gerarJogos(sorteio: () => number, elenco: Modelo[], hoje: string): Jogo[] {
  const porPosicao = (p: Posicao) => elenco.filter((m) => m.posicao === p);
  return [-24, -17, -10, -3].map((d, i) => {
    const goleiro = porPosicao('Goleiro')[i % 2];
    const titulares = [
      goleiro,
      ...porPosicao('Zagueiro'), ...porPosicao('Lateral'),
      ...porPosicao('Volante').slice(0, 1 + (i % 2)), ...porPosicao('Meia'),
      ...porPosicao('Atacante').slice(0, 3),
    ].slice(0, 11);
    const golsPro = Math.floor(sorteio() * 4) + (i === 3 ? 1 : 0);
    const golsContra = Math.floor(sorteio() * 3);
    const estatisticas: EstatisticaJogo[] = titulares.map((m) => ({ atletaId: m.id, gols: 0, assistencias: 0, desarmes: 0, defesas: 0 }));
    const atacantes = estatisticas.filter((e) => ['Atacante', 'Meia'].includes(elenco.find((m) => m.id === e.atletaId)!.posicao));
    const criadores = estatisticas.filter((e) => ['Meia', 'Lateral', 'Atacante', 'Volante'].includes(elenco.find((m) => m.id === e.atletaId)!.posicao));
    for (let g = 0; g < golsPro; g++) {
      const autor = atacantes[Math.floor(sorteio() * atacantes.length)];
      autor.gols += 1;
      if (sorteio() < 0.7) {
        const outros = criadores.filter((c) => c !== autor);
        outros[Math.floor(sorteio() * outros.length)].assistencias += 1;
      }
    }
    for (const e of estatisticas) {
      const posicao = elenco.find((m) => m.id === e.atletaId)!.posicao;
      if (posicao === 'Goleiro') e.defesas = 2 + Math.floor(sorteio() * 5);
      else if (['Zagueiro', 'Volante', 'Lateral'].includes(posicao)) e.desarmes = 1 + Math.floor(sorteio() * 5);
      else e.desarmes = Math.floor(sorteio() * 2);
    }
    return {
      id: `j-${i}`,
      data: somarDias(hoje, d),
      categoria: 'Sub-17' as const,
      adversario: `${ADVERSARIOS[i]} Sub-17`,
      mando: i % 2 === 0 ? ('casa' as const) : ('fora' as const),
      golsPro,
      golsContra,
      estatisticas,
    };
  });
}

/* ---------- Banco completo ---------- */

function criarAtleta(m: Modelo, hoje: string, sorteio: () => number, votantes: string[], academia: boolean, i: number): Atleta {
  return {
    id: m.id,
    nome: m.nome,
    apelido: m.apelido ?? null,
    foto: null,
    nacionalidade: m.nacionalidade ?? 'Brasil',
    nascimento: nascimentoPara(m.idade, hoje, sorteio()),
    posicao: m.posicao,
    pe: m.pe,
    cidade: m.cidade,
    uf: m.uf,
    alturaCm: m.alturaCm,
    pesoKg: m.pesoKg,
    status: academia ? 'academia' : 'candidato',
    numero: academia ? m.numero ?? null : null,
    desde: academia ? somarDias(hoje, -(400 + i * 45)) : null,
    responsavel: m.responsavel
      ? { nome: m.responsavel, email: `${m.responsavel.split(' ')[0].toLowerCase()}@exemplo.com`, telefone: '24999990000' }
      : null,
    avaliacoes: academia ? gerarAvaliacoes(sorteio, m, hoje) : [],
    checkins: academia ? gerarCheckins(sorteio, m, hoje) : [],
    tags: montarTags(m, votantes, sorteio),
  };
}

export function criarBancoExemplo(hoje = hojeISO()): BancoDados {
  const sorteio = criarSorteio(2026);
  const votantes = [...ACADEMIA, ...CANDIDATOS].map((m) => `u-${m.id.slice(2)}`).concat(['u-carla', 'u-rogerio']);

  const atletas: Atleta[] = [
    ...ACADEMIA.map((m, i) => criarAtleta(m, hoje, sorteio, votantes, true, i)),
    ...CANDIDATOS.map((m, i) => criarAtleta(m, hoje, sorteio, votantes, false, i)),
  ];

  const sub17 = ACADEMIA.filter((m) => categoriaPorIdade(m.idade) === 'Sub-17');
  const treinos = gerarTreinos(sorteio, sub17, hoje);
  const jogos = gerarJogos(sorteio, sub17, hoje);

  const CT = { local: 'CT Pelé Academia', endereco: 'Centro de Excelência Pelé Academia', cidade: 'Resende', uf: 'RJ', lat: -22.4686, lng: -44.4466 };
  const peneiras: Peneira[] = [
    { id: 'p-sub15-anterior', categoria: 'Sub-15', data: somarDias(hoje, -60), horario: '09:00', vagas: 25, ...CT },
    { id: 'p-sub17-resende', categoria: 'Sub-17', data: somarDias(hoje, -4), horario: '09:00', vagas: 20, ...CT },
    { id: 'p-sub15-resende', categoria: 'Sub-15', data: somarDias(hoje, 9), horario: '09:00', vagas: 25, ...CT },
    { id: 'p-sub13-salvador', categoria: 'Sub-13 Futsal', data: somarDias(hoje, 12), horario: '14:00', vagas: 30, local: 'Estádio de Pituaçu', endereco: 'Av. Pinto de Aguiar, Pituaçu', cidade: 'Salvador', uf: 'BA', lat: -12.9562, lng: -38.4136 },
    { id: 'p-sub17-rio', categoria: 'Sub-17', data: somarDias(hoje, 16), horario: '08:30', vagas: 18, local: 'Parque Olímpico da Barra', endereco: 'Av. Embaixador Abelardo Bueno, 3401, Barra da Tijuca', cidade: 'Rio de Janeiro', uf: 'RJ', lat: -22.9772, lng: -43.395 },
    { id: 'p-sub17-sp', categoria: 'Sub-17', data: somarDias(hoje, 23), horario: '09:00', vagas: 2, local: 'Centro Olímpico', endereco: 'Av. Ibirapuera, 1315, Vila Clementino', cidade: 'São Paulo', uf: 'SP', lat: -23.5973, lng: -46.6547 },
    { id: 'p-sub20-bh', categoria: 'Sub-20', data: somarDias(hoje, 30), horario: '10:00', vagas: 20, local: 'Centro de treinamento parceiro', endereco: 'Av. Antônio Abrahão Caram, 1000, São José', cidade: 'Belo Horizonte', uf: 'MG', lat: -19.8658, lng: -43.9713 },
    { id: 'p-sub11-resende', categoria: 'Sub-11 Futsal', data: somarDias(hoje, 37), horario: '15:00', vagas: 30, ...CT, local: 'Ginásio do CT Pelé Academia' },
  ];

  const davi = atletas.find((a) => a.id === 'a-davi')!;
  const avaliacaoDavi: Avaliacao = {
    id: 'av-a-davi-peneira',
    data: somarDias(hoje, -60),
    avaliador: 'Carla Mendes',
    origem: 'peneira',
    notas: { velocidade: 7, passe: 5, drible: 6, finalizacao: 6.5, posicionamento: 5, fisico: 5.5 },
    observacao: 'Rápido e agressivo no ataque. Precisa melhorar passe e leitura sem a bola.',
  };
  davi.avaliacoes.push(avaliacaoDavi);

  const inscricoes: Inscricao[] = [
    { id: 'i-1', peneiraId: 'p-sub17-resende', atletaId: 'a-kaua', status: 'inscrito', avaliacaoId: null, dataInscricao: somarDias(hoje, -20) },
    { id: 'i-2', peneiraId: 'p-sub17-resende', atletaId: 'a-miguel', status: 'inscrito', avaliacaoId: null, dataInscricao: somarDias(hoje, -18) },
    { id: 'i-3', peneiraId: 'p-sub17-resende', atletaId: 'a-pedro', status: 'inscrito', avaliacaoId: null, dataInscricao: somarDias(hoje, -15) },
    { id: 'i-4', peneiraId: 'p-sub15-resende', atletaId: 'a-arthur', status: 'inscrito', avaliacaoId: null, dataInscricao: somarDias(hoje, -6) },
    { id: 'i-5', peneiraId: 'p-sub15-anterior', atletaId: 'a-davi', status: 'reprovado', avaliacaoId: avaliacaoDavi.id, dataInscricao: somarDias(hoje, -75) },
    { id: 'i-6', peneiraId: 'p-sub15-resende', atletaId: 'a-davi', status: 'inscrito', avaliacaoId: null, dataInscricao: somarDias(hoje, -3) },
    { id: 'i-7', peneiraId: 'p-sub17-sp', atletaId: 'a-miguel', status: 'inscrito', avaliacaoId: null, dataInscricao: somarDias(hoje, -2) },
    { id: 'i-8', peneiraId: 'p-sub17-sp', atletaId: 'a-pedro', status: 'inscrito', avaliacaoId: null, dataInscricao: somarDias(hoje, -1) },
    { id: 'i-9', peneiraId: 'p-sub17-rio', atletaId: 'a-kaua', status: 'inscrito', avaliacaoId: null, dataInscricao: somarDias(hoje, -2) },
  ];

  const emailDe: Record<string, string> = {
    'a-joao': 'joao@exemplo.com',
    'a-kaua': 'kaua@exemplo.com',
    'a-lucas': 'lucas@exemplo.com',
  };
  const usuarios: Usuario[] = [
    ...atletas.map((a): Usuario => ({
      id: `u-${a.id.slice(2)}`,
      tipo: 'atleta',
      nome: a.nome,
      email: emailDe[a.id] ?? `${a.id.slice(2)}@exemplo.com`,
      senha: SENHA_DEMONSTRACAO,
      cargo: null,
      atletaId: a.id,
      seguindo: a.id === 'a-joao' ? ['a-lucas', 'a-bruno'] : a.id === 'a-kaua' ? ['a-joao'] : [],
    })),
    { id: 'u-carla', tipo: 'equipe', nome: 'Carla Mendes', email: 'tecnico@peleacademia.com.br', senha: SENHA_DEMONSTRACAO, cargo: 'Técnica e olheira', atletaId: null, seguindo: ['a-miguel', 'a-joao'] },
    { id: 'u-rogerio', tipo: 'equipe', nome: 'Rogério Alves', email: 'preparador@peleacademia.com.br', senha: SENHA_DEMONSTRACAO, cargo: 'Preparador físico', atletaId: null, seguindo: [] },
  ];

  return { versao: VERSAO_DADOS, usuarios, atletas, peneiras, inscricoes, treinos, jogos, consultas: [] };
}
