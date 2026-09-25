import { iniciais } from '../../lib/texto';

const tamanhos = { sm: 'size-10 text-sm', md: 'size-12 text-base', lg: 'size-16 text-xl' };

export function Avatar({ nome, tamanho = 'md' }: { nome: string; tamanho?: keyof typeof tamanhos }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-realce-suave font-display font-bold text-realce ${tamanhos[tamanho]}`}
    >
      {iniciais(nome)}
    </span>
  );
}
