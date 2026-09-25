import type { Inscricao, Peneira } from '../../tipos';
import { ROTULO_BEM_ESTAR, ROTULO_TENDENCIA, type NivelBemEstar, type TipoTendencia } from '../../lib/regras';
import { Etiqueta, type TomEtiqueta } from '../ui/Etiqueta';

const TOM_TENDENCIA: Record<TipoTendencia, TomEtiqueta> = {
  evolucao: 'sucesso',
  estavel: 'marca',
  atencao: 'atencao',
  'sem-dados': 'neutro',
};

export function EtiquetaTendencia({ tipo }: { tipo: TipoTendencia }) {
  return <Etiqueta tom={TOM_TENDENCIA[tipo]}>{ROTULO_TENDENCIA[tipo]}</Etiqueta>;
}

const TOM_BEM_ESTAR: Record<NivelBemEstar, TomEtiqueta> = { bom: 'sucesso', atencao: 'atencao', baixo: 'erro' };

export function EtiquetaBemEstar({ nivel }: { nivel: NivelBemEstar }) {
  return <Etiqueta tom={TOM_BEM_ESTAR[nivel]}>{ROTULO_BEM_ESTAR[nivel]}</Etiqueta>;
}

export function situacaoInscricao(inscricao: Inscricao, peneira: Peneira, hoje: string): { texto: string; tom: TomEtiqueta } {
  if (inscricao.status === 'aprovado') return { texto: 'Aprovado', tom: 'sucesso' };
  if (inscricao.status === 'reprovado') return { texto: 'Não aprovado', tom: 'erro' };
  if (peneira.data > hoje) return { texto: 'Inscrito', tom: 'marca' };
  if (peneira.data === hoje) return { texto: 'Peneira hoje', tom: 'acento' };
  return { texto: 'Em avaliação', tom: 'atencao' };
}

export function EtiquetaInscricao({ inscricao, peneira, hoje }: { inscricao: Inscricao; peneira: Peneira; hoje: string }) {
  const { texto, tom } = situacaoInscricao(inscricao, peneira, hoje);
  return <Etiqueta tom={tom}>{texto}</Etiqueta>;
}
