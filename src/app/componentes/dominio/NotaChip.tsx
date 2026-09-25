import { faixaDaNota, type FaixaNota } from '../../lib/desempenho';
import { formatarNumero } from '../../lib/texto';

const CORES: Record<FaixaNota, string> = {
  elite: 'bg-nota-elite text-white',
  otima: 'bg-nota-otima text-white',
  boa: 'bg-nota-boa text-sobre-acento',
  regular: 'bg-nota-regular text-sobre-acento',
  ruim: 'bg-nota-ruim text-white',
};

const TAMANHOS = { sm: 'min-w-9 px-1.5 text-sm', md: 'min-w-11 px-2 text-base', lg: 'min-w-16 px-3 text-2xl' };

/** Nota colorida por faixa, no estilo dos apps de estatística de futebol. */
export function NotaChip({ nota, tamanho = 'md', rotulo, animar, naFaixa }: { nota: number; tamanho?: keyof typeof TAMANHOS; rotulo?: string; animar?: boolean; naFaixa?: boolean }) {
  return (
    <span
      key={animar ? nota : undefined}
      className={`num inline-flex items-center justify-center rounded-full py-0.5 font-semibold ${CORES[faixaDaNota(nota)]} ${TAMANHOS[tamanho]} ${animar ? 'pulso' : ''} ${naFaixa ? 'ring-2 ring-sobre-marca/80' : ''}`}
      aria-label={rotulo ? `${rotulo}: ${formatarNumero(nota)}` : undefined}
    >
      {formatarNumero(nota)}
    </span>
  );
}
