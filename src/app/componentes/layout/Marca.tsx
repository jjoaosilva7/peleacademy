import logo from '../../../assets/pele-logo.png';

export function Marca({ clara = false }: { clara?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="inline-flex size-9 items-center justify-center rounded-full bg-white p-1 shadow-folha">
        <img src={logo} alt="" className="size-full rounded-full object-contain" />
      </span>
      <span className={`font-display text-2xl font-extrabold uppercase leading-none ${clara ? 'text-sobre-marca' : 'text-tinta'}`}>
        Pelé Academia
      </span>
    </span>
  );
}

/** Marcações de um campo de futebol, usadas como textura nos blocos escuros. */
export function Gramado({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 size-full ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="12" y="12" width="376" height="236" />
      <line x1="200" y1="12" x2="200" y2="248" />
      <circle cx="200" cy="130" r="40" />
      <circle cx="200" cy="130" r="2.5" fill="currentColor" />
      <rect x="12" y="68" width="56" height="124" />
      <rect x="12" y="100" width="22" height="60" />
      <path d="M68 108 A 30 30 0 0 1 68 152" />
      <rect x="332" y="68" width="56" height="124" />
      <rect x="366" y="100" width="22" height="60" />
      <path d="M332 108 A 30 30 0 0 0 332 152" />
    </svg>
  );
}

/** Mantido para compatibilidade: blocos que usavam nuvens agora usam o gramado. */
export function Nuvens({ estrelas: _estrelas = true }: { estrelas?: boolean }) {
  return <Gramado className="-z-10 text-sobre-marca/8" />;
}
