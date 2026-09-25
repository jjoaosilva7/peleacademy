import type { Atleta } from '../../tipos';
import { iniciais } from '../../lib/texto';

const tamanhos = {
  xs: 'w-9 text-xs',
  sm: 'w-11 text-sm',
  md: 'w-14 text-base',
  lg: 'w-24 text-2xl',
  xl: 'w-32 text-3xl',
};

/** Foto 3x4 do jogador. Sem foto, mostra uma silhueta com as iniciais para o treinador identificar. */
export function FotoJogador({ atleta, tamanho = 'md', className = '', fundo = 'bg-superficie-2', redonda = false }: { atleta: Pick<Atleta, 'nome' | 'foto'>; tamanho?: keyof typeof tamanhos; className?: string; fundo?: string; redonda?: boolean }) {
  const forma = redonda ? 'aspect-square rounded-full' : 'aspect-3/4 rounded-md';
  const classe = `relative shrink-0 overflow-hidden ${forma} ${tamanhos[tamanho]} ${className}`;
  if (atleta.foto) {
    return <img src={atleta.foto} alt={`Foto de ${atleta.nome}`} className={`${classe} object-cover`} />;
  }
  return (
    <span role="img" aria-label={`${atleta.nome}, sem foto`} className={`${classe} flex items-end justify-center ${fundo}`}>
      <svg aria-hidden="true" viewBox="0 0 30 40" className="absolute inset-0 size-full text-linha">
        <circle cx="15" cy="15" r="7" fill="currentColor" />
        <path d="M2 40 C2 29 8 25 15 25 C22 25 28 29 28 40 Z" fill="currentColor" />
      </svg>
      <span className="relative mb-[8%] font-display font-bold text-tinta">{iniciais(atleta.nome)}</span>
    </span>
  );
}
