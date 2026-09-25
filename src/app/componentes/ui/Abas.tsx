import { useRef, type KeyboardEvent, type ReactNode } from 'react';

interface Aba {
  id: string;
  rotulo: ReactNode;
}

/** Abas acessíveis: setas do teclado alternam entre as abas (padrão WAI-ARIA). */
export function Abas({ abas, ativa, aoMudar, rotulo }: { abas: Aba[]; ativa: string; aoMudar: (id: string) => void; rotulo: string }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function aoTeclar(evento: KeyboardEvent<HTMLDivElement>) {
    const indice = abas.findIndex((a) => a.id === ativa);
    let proximo = indice;
    if (evento.key === 'ArrowRight') proximo = (indice + 1) % abas.length;
    else if (evento.key === 'ArrowLeft') proximo = (indice - 1 + abas.length) % abas.length;
    else if (evento.key === 'Home') proximo = 0;
    else if (evento.key === 'End') proximo = abas.length - 1;
    else return;
    evento.preventDefault();
    aoMudar(abas[proximo].id);
    refs.current[abas[proximo].id]?.focus();
  }

  return (
    <div role="tablist" aria-label={rotulo} onKeyDown={aoTeclar} className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-superficie-2 p-1">
      {abas.map((aba) => {
        const selecionada = aba.id === ativa;
        return (
          <button
            key={aba.id}
            ref={(el) => {
              refs.current[aba.id] = el;
            }}
            type="button"
            role="tab"
            id={`aba-${aba.id}`}
            aria-selected={selecionada}
            aria-controls={`painel-${aba.id}`}
            tabIndex={selecionada ? 0 : -1}
            onClick={() => aoMudar(aba.id)}
            className={
              'min-h-10 shrink-0 rounded-full px-4 text-base font-medium transition-colors ' +
              (selecionada ? 'bg-superficie text-tinta shadow-folha' : 'text-tinta-suave hover:text-tinta')
            }
          >
            {aba.rotulo}
          </button>
        );
      })}
    </div>
  );
}

export function PainelAba({ id, children, className = 'pt-5' }: { id: string; children: ReactNode; className?: string }) {
  return (
    <div role="tabpanel" id={`painel-${id}`} aria-labelledby={`aba-${id}`} tabIndex={0} className={className}>
      {children}
    </div>
  );
}
