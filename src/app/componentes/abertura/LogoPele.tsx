import { OURO_LOGO, PECAS, VIEWBOX } from './LogoPeleAcademia';

/** Logo da Pelé Academia em vetor (dourado), para usar em fundos escuros. */
export function LogoPele({ className = 'w-56' }: { className?: string }) {
  return (
    <svg viewBox={VIEWBOX} role="img" aria-label="Pelé Academia" className={`block h-auto ${className}`}>
      {PECAS.map((p) => <path key={p.id} d={p.d} fillRule={p.regraPreenchimento} fill={OURO_LOGO} />)}
      <text x="141.3" y="37.4" textAnchor="middle" fontFamily="'Instrument Sans', Arial, sans-serif" fontWeight="700" fontSize="5.2" letterSpacing="1.6" fill="#0b0b0b">
        ACADEMIA
      </text>
    </svg>
  );
}
