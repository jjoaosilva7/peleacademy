/*
 * Avisos temporários (toasts) que confirmam o resultado de cada ação.
 * A região usa aria-live para que leitores de tela anunciem as mensagens.
 */
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';

type Tom = 'sucesso' | 'atencao' | 'erro' | 'info';

interface ItemAviso {
  id: number;
  texto: string;
  tom: Tom;
}

const Contexto = createContext<(texto: string, tom?: Tom) => void>(() => undefined);

const estilos: Record<Tom, { classe: string; Icone: typeof Info }> = {
  sucesso: { classe: 'border-sucesso/40 text-sucesso', Icone: CircleCheck },
  atencao: { classe: 'border-atencao/40 text-atencao', Icone: TriangleAlert },
  erro: { classe: 'border-erro/40 text-erro', Icone: CircleAlert },
  info: { classe: 'border-linha text-realce', Icone: Info },
};

export function ProvedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<ItemAviso[]>([]);
  const contador = useRef(0);

  const fechar = useCallback((id: number) => setAvisos((lista) => lista.filter((a) => a.id !== id)), []);

  const avisar = useCallback(
    (texto: string, tom: Tom = 'sucesso') => {
      contador.current += 1;
      const id = contador.current;
      setAvisos((lista) => [...lista.slice(-2), { id, texto, tom }]);
      window.setTimeout(() => fechar(id), 5000);
    },
    [fechar],
  );

  return (
    <Contexto.Provider value={avisar}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 z-50 flex flex-col items-center gap-2 px-4"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
      >
        {avisos.map(({ id, texto, tom }) => {
          const { classe, Icone } = estilos[tom];
          return (
            <div
              key={id}
              role="status"
              className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-md border bg-superficie p-3 shadow-lg ${classe}`}
            >
              <Icone aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <p className="flex-1 text-base font-medium text-tinta">{texto}</p>
              <button
                type="button"
                onClick={() => fechar(id)}
                aria-label="Fechar aviso"
                className="-m-1 inline-flex size-8 items-center justify-center rounded-full text-tinta-suave hover:bg-superficie-2 hover:text-tinta"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Contexto.Provider>
  );
}

export function useAviso() {
  return useContext(Contexto);
}
