/*
 * Tela de abertura (preloader) da Pelé Academia.
 * O logo é "desenhado" como num editor vetorial, ganha o dourado,
 * mostra o slogan e dá um zoom para dentro da figura antes de revelar o app.
 * Duração: cerca de 4,6 s, com botão "Pular". Aparece a cada abertura ou recarga da página.
 */
import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { OURO_LOGO, PECAS, VIEWBOX } from './LogoPeleAcademia';
import './abertura.css';

const DURACAO_MS = 4650;
const DURACAO_REDUZIDA_MS = 1100;

/** Permite pular a abertura em testes automatizados (window.__semAbertura = true). */
export function aberturaDesligada(): boolean {
  return Boolean((window as Window & { __semAbertura?: boolean }).__semAbertura);
}

const estilo = (vars: Record<string, string | number>) => vars as CSSProperties;

export function Abertura({ aoTerminar }: { aoTerminar: () => void }) {
  const id = useId().replace(/:/g, '');
  const [reduzido] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const terminou = useRef(false);
  const pular = useRef<HTMLButtonElement>(null);

  const terminar = useCallback(() => {
    if (terminou.current) return;
    terminou.current = true;
    aoTerminar();
  }, [aoTerminar]);

  useEffect(() => {
    const t = window.setTimeout(terminar, reduzido ? DURACAO_REDUZIDA_MS : DURACAO_MS);
    return () => window.clearTimeout(t);
  }, [terminar, reduzido]);

  return (
    <div className={`abertura ${reduzido ? 'abertura-reduzida' : ''}`} role="status" aria-label="Carregando a Pelé Academia. Onde o legado entra em campo.">
      {/* O palco é decorativo: o status já é anunciado pelo aria-label do contêiner. */}
      <div className="abertura-palco" aria-hidden="true">
        <svg viewBox={VIEWBOX} className="abertura-logo" aria-hidden="true">
          <defs>
            <clipPath id={`${id}-recorte`}>
              {PECAS.map((p) => <path key={p.id} d={p.d} fillRule={p.regraPreenchimento} clipRule={p.regraPreenchimento} />)}
            </clipPath>
            <linearGradient id={`${id}-brilho`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g className="abertura-marca">
            {PECAS.map((p, i) => (
              <path key={`cheio-${p.id}`} className="abertura-cheio" style={estilo({ '--i': i })} d={p.d} fillRule={p.regraPreenchimento} fill={OURO_LOGO} />
            ))}
            <text
              className="abertura-cheio"
              style={estilo({ '--i': PECAS.length })}
              x="141.3" y="37.4" textAnchor="middle"
              fontFamily="'Instrument Sans', Arial, sans-serif" fontWeight="700" fontSize="5.2" letterSpacing="1.6"
              fill="#0b0b0b"
            >
              ACADEMIA
            </text>

            <g clipPath={`url(#${id}-recorte)`}>
              <rect className="abertura-brilho" x="0" y="0" width="26" height="70" fill={`url(#${id}-brilho)`} />
            </g>

            {PECAS.map((p, i) => (
              <path key={`contorno-${p.id}`} className="abertura-contorno" style={estilo({ '--i': i })} d={p.d} pathLength={1} />
            ))}
            {PECAS.flatMap((p, i) =>
              p.ancoras.map(([x, y], j) => (
                <rect
                  key={`ancora-${p.id}-${j}`}
                  className="abertura-ancora"
                  style={estilo({ '--i': i, '--j': j })}
                  x={x - 0.6} y={y - 0.6} width="1.2" height="1.2"
                />
              )),
            )}

          </g>
        </svg>
        <p className="abertura-slogan">Onde o legado entra em campo</p>
        <span className="abertura-linha" />
      </div>

      <button ref={pular} type="button" className="abertura-pular" onClick={terminar}>
        Pular
      </button>
    </div>
  );
}
