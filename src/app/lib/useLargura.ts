import { useEffect, useRef, useState } from 'react';

/** Mede a largura real do elemento para desenhar gráficos em pixels (texto sem distorção). */
export function useLargura<T extends HTMLElement>(inicial = 400) {
  const ref = useRef<T>(null);
  const [largura, setLargura] = useState(inicial);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;
    const medir = () => setLargura(Math.max(elemento.clientWidth, 240));
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return [ref, largura] as const;
}
