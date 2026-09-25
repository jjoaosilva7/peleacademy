export type Posicao = 'Goleiro' | 'Zagueiro' | 'Lateral' | 'Volante' | 'Meia' | 'Atacante';
export type PeDominante = 'Direito' | 'Esquerdo' | 'Ambos';
export type Categoria = 'Sub-11 Futsal' | 'Sub-13 Futsal' | 'Sub-15' | 'Sub-17' | 'Sub-20';
export type Criterio = 'velocidade' | 'passe' | 'drible' | 'finalizacao' | 'posicionamento' | 'fisico';
export type Notas = Record<Criterio, number>;

export interface Avaliacao {
  id: string;
  data: string;
  avaliador: string;
  origem: 'peneira' | 'academia';
  notas: Notas;
  observacao: string;
}

export interface CheckIn {
  data: string;
  /** Escalas de 1 (pior) a 5 (melhor) */
  sono: number;
  dor: number;
  cansaco: number;
  estresse: number;
  /** Duração do treino em minutos */
  minutos: number;
  /** Esforço percebido de 0 a 10 */
  esforco: number;
}

export interface Tag {
  id: string;
  nome: string;
  /** ids dos usuários que confirmaram o atributo */
  votos: string[];
}

export interface Responsavel {
  nome: string;
  email: string;
  telefone: string;
}

export type Nacionalidade = 'Brasil' | 'Argentina' | 'Uruguai' | 'Paraguai' | 'Portugal' | 'Outro';

export interface Atleta {
  id: string;
  nome: string;
  apelido: string | null;
  /** Foto 3x4 recortada no app (data URL JPEG 300x400) */
  foto: string | null;
  nacionalidade: Nacionalidade;
  nascimento: string;
  posicao: Posicao;
  pe: PeDominante;
  cidade: string;
  uf: string;
  alturaCm: number | null;
  pesoKg: number | null;
  status: 'candidato' | 'academia';
  numero: number | null;
  desde: string | null;
  responsavel: Responsavel | null;
  avaliacoes: Avaliacao[];
  checkins: CheckIn[];
  tags: Tag[];
}

export interface Usuario {
  id: string;
  tipo: 'atleta' | 'equipe';
  nome: string;
  email: string;
  senha: string;
  cargo: string | null;
  atletaId: string | null;
  /** Atletas seguidos (atleta) ou favoritados (equipe) */
  seguindo: string[];
}

export interface Peneira {
  id: string;
  categoria: Categoria;
  data: string;
  horario: string;
  local: string;
  endereco: string;
  cidade: string;
  uf: string;
  lat: number;
  lng: number;
  vagas: number;
}

/* ---------- Treinos, jogos e cuidado ---------- */

export type StatTreino =
  | 'gols' | 'assistencias' | 'finalizacoes' | 'passesDecisivos' | 'dribles'
  | 'desarmes' | 'interceptacoes' | 'defesas' | 'golsSofridos' | 'perdas';

export type Falha = 'passe' | 'finalizacao' | 'marcacao' | 'posicionamento' | 'intensidade' | 'decisao';

export interface RegistroTreino {
  atletaId: string;
  stats: Partial<Record<StatTreino, number>>;
  falhas: Falha[];
  /** Ajuste manual do treinador, de -1 a +1 */
  ajuste: number;
}

export interface Treino {
  id: string;
  data: string;
  categoria: Categoria;
  avaliador: string;
  registros: RegistroTreino[];
}

export interface EstatisticaJogo {
  atletaId: string;
  gols: number;
  assistencias: number;
  desarmes: number;
  defesas: number;
}

export interface Jogo {
  id: string;
  data: string;
  categoria: Categoria;
  adversario: string;
  mando: 'casa' | 'fora';
  golsPro: number;
  golsContra: number;
  estatisticas: EstatisticaJogo[];
}

export type Profissional = 'fisio' | 'psicologo';

export interface Consulta {
  id: string;
  atletaId: string;
  profissional: Profissional;
  data: string;
  horario: string;
  motivo: string;
  /** Quem marcou: o próprio atleta pelo app ou a equipe técnica (encaminhamento) */
  origem: 'atleta' | 'equipe';
}

export interface Inscricao {
  id: string;
  peneiraId: string;
  atletaId: string;
  status: 'inscrito' | 'aprovado' | 'reprovado';
  avaliacaoId: string | null;
  dataInscricao: string;
}

export interface BancoDados {
  versao: number;
  usuarios: Usuario[];
  atletas: Atleta[];
  peneiras: Peneira[];
  inscricoes: Inscricao[];
  treinos: Treino[];
  jogos: Jogo[];
  consultas: Consulta[];
}
