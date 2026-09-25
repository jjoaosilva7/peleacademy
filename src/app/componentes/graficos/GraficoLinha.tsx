import { formatarNumero } from '../../lib/texto';
import { useLargura } from '../../lib/useLargura';

interface Ponto {
  rotulo: string;
  valor: number;
}

const A = 220;
const M = { topo: 26, direita: 24, base: 30, esquerda: 32 };

/** Gráfico de linha em SVG, sem biblioteca. A descrição resume os dados para leitores de tela. */
export function GraficoLinha({ pontos, min = 0, max = 10, descricao }: { pontos: Ponto[]; min?: number; max?: number; descricao: string }) {
  const [ref, L] = useLargura<HTMLDivElement>();
  const larguraUtil = L - M.esquerda - M.direita;
  const alturaUtil = A - M.topo - M.base;
  const x = (i: number) => M.esquerda + (pontos.length === 1 ? larguraUtil / 2 : (i * larguraUtil) / (pontos.length - 1));
  const y = (v: number) => M.topo + (1 - (v - min) / (max - min)) * alturaUtil;
  const marcas = [min, min + (max - min) / 2, max];
  const caminho = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.valor)}`).join(' ');

  return (
    <div ref={ref} className="w-full min-w-0 overflow-hidden">
    <svg viewBox={`0 0 ${L} ${A}`} role="img" aria-label={descricao} className="block h-auto w-full max-w-full">
      {marcas.map((m) => (
        <g key={m}>
          <line x1={M.esquerda} x2={L - M.direita} y1={y(m)} y2={y(m)} className="stroke-linha" strokeWidth="1" />
          <text x={M.esquerda - 8} y={y(m) + 4} textAnchor="end" className="fill-tinta-suave text-sm">
            {formatarNumero(m, 0)}
          </text>
        </g>
      ))}
      <path d={caminho} fill="none" className="stroke-realce" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {pontos.map((p, i) => {
        const ultimo = i === pontos.length - 1;
        // Em telas estreitas, mostra um rótulo de data sim, outro não, para não sobrepor
        const passoRotulo = Math.max(1, Math.ceil((pontos.length * 48) / larguraUtil));
        const mostrarRotulo = ultimo || (pontos.length - 1 - i) % passoRotulo === 0;
        return (
          <g key={`${p.rotulo}-${i}`}>
            <circle cx={x(i)} cy={y(p.valor)} r={ultimo ? 6 : 4.5} className={ultimo ? 'fill-acento stroke-marca' : 'fill-superficie stroke-realce'} strokeWidth="2.5" />
            <text x={x(i)} y={y(p.valor) - 11} textAnchor="middle" className="fill-tinta text-sm font-semibold">
              {formatarNumero(p.valor)}
            </text>
            {mostrarRotulo && (
              <text x={x(i)} y={A - 8} textAnchor="middle" className="fill-tinta-suave text-sm">
                {p.rotulo}
              </text>
            )}
          </g>
        );
      })}
    </svg>
    </div>
  );
}
