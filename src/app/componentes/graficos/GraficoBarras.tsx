import { useLargura } from '../../lib/useLargura';

interface Barra {
  rotulo: string;
  valor: number;
  destaque?: boolean;
}

const A = 200;
const M = { topo: 12, direita: 4, base: 28, esquerda: 4 };

/** Barras verticais em SVG. Barras em destaque (ex.: dias de carga alta) usam a cor de atenção. */
export function GraficoBarras({ barras, descricao, referencia }: { barras: Barra[]; descricao: string; referencia?: number }) {
  const [ref, L] = useLargura<HTMLDivElement>();
  const maximo = Math.max(...barras.map((b) => b.valor), referencia ?? 0, 1);
  const larguraUtil = L - M.esquerda - M.direita;
  const alturaUtil = A - M.topo - M.base;
  const passo = larguraUtil / barras.length;
  const largura = Math.max(passo * 0.62, 4);
  const y = (v: number) => M.topo + (1 - v / maximo) * alturaUtil;

  return (
    <div ref={ref} className="w-full min-w-0 overflow-hidden">
    <svg viewBox={`0 0 ${L} ${A}`} role="img" aria-label={descricao} className="block h-auto w-full max-w-full">
      <line x1={M.esquerda} x2={L - M.direita} y1={y(0)} y2={y(0)} className="stroke-linha" strokeWidth="1" />
      {referencia !== undefined && (
        <line x1={M.esquerda} x2={L - M.direita} y1={y(referencia)} y2={y(referencia)} className="stroke-tinta-suave" strokeWidth="1.5" strokeDasharray="5 5" />
      )}
      {barras.map((b, i) => {
        const cx = M.esquerda + passo * i + passo / 2;
        const altura = y(0) - y(b.valor);
        return (
          <g key={`${b.rotulo}-${i}`}>
            {b.valor > 0 && (
              <rect x={cx - largura / 2} y={y(b.valor)} width={largura} height={altura} rx="3" className={b.destaque ? 'fill-atencao' : 'fill-realce'} />
            )}
            {(barras.length <= 8 || L >= 520 || i % 2 === 0) && (
              <text x={cx} y={A - 8} textAnchor="middle" className="fill-tinta-suave text-sm">
                {b.rotulo}
              </text>
            )}
          </g>
        );
      })}
    </svg>
    </div>
  );
}
