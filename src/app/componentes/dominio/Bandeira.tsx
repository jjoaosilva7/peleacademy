import type { Nacionalidade } from '../../tipos';

/** Desenho da bandeira em uma área de 30x20 (sem imagens externas). */
export function FormasBandeira({ pais }: { pais: Nacionalidade }) {
  switch (pais) {
    case 'Brasil':
      return (
        <>
          <rect width="30" height="20" fill="#009c3b" />
          <path d="M15 2.5 L27 10 L15 17.5 L3 10 Z" fill="#ffdf00" />
          <circle cx="15" cy="10" r="4.2" fill="#002776" />
        </>
      );
    case 'Argentina':
      return (
        <>
          <rect width="30" height="20" fill="#74acdf" />
          <rect y="6.67" width="30" height="6.67" fill="#fff" />
          <circle cx="15" cy="10" r="1.8" fill="#f6b40e" />
        </>
      );
    case 'Uruguai':
      return (
        <>
          <rect width="30" height="20" fill="#fff" />
          {[2.2, 6.7, 11.1, 15.6].map((y) => <rect key={y} y={y} width="30" height="2.2" fill="#0038a8" />)}
          <rect width="12" height="11" fill="#fff" />
          <circle cx="6" cy="5.5" r="2.4" fill="#fcd116" />
        </>
      );
    case 'Paraguai':
      return (
        <>
          <rect width="30" height="6.67" fill="#d52b1e" />
          <rect y="6.67" width="30" height="6.67" fill="#fff" />
          <rect y="13.33" width="30" height="6.67" fill="#0038a8" />
        </>
      );
    case 'Portugal':
      return (
        <>
          <rect width="30" height="20" fill="#da291c" />
          <rect width="12" height="20" fill="#046a38" />
          <circle cx="12" cy="10" r="3.2" fill="#ffe900" />
        </>
      );
    default:
      return (
        <>
          <rect width="30" height="20" fill="#8a9aa6" />
          <circle cx="15" cy="10" r="6" fill="none" stroke="#fff" strokeWidth="1.2" />
          <path d="M9 10 H21 M15 4 C12 7 12 13 15 16 C18 13 18 7 15 4" fill="none" stroke="#fff" strokeWidth="1" />
        </>
      );
  }
}

export function Bandeira({ pais, className = 'h-4 w-6' }: { pais: Nacionalidade; className?: string }) {
  return (
    <svg role="img" aria-label={pais} viewBox="0 0 30 20" className={`${className} shrink-0 rounded-[2px]`}>
      <FormasBandeira pais={pais} />
    </svg>
  );
}
