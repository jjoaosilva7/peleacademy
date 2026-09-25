import { Minus, Plus } from 'lucide-react';

/** Contador de estatística com botões grandes: pensado para o olheiro marcar rápido na beira do campo. */
export function Contador({ id, rotulo, valor, aoMudar, negativo }: { id: string; rotulo: string; valor: number; aoMudar: (v: number) => void; negativo?: boolean }) {
  return (
    <div role="group" aria-labelledby={`${id}-rotulo`} className="flex items-center justify-between gap-2 rounded-2xl bg-superficie-2 p-1.5 pl-4">
      <span id={`${id}-rotulo`} className={`min-w-0 text-sm font-semibold ${negativo ? 'text-tinta-suave' : 'text-tinta'}`}>{rotulo}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => aoMudar(Math.max(0, valor - 1))}
          disabled={valor === 0}
          aria-label={`Diminuir ${rotulo}`}
          className="inline-flex size-10 items-center justify-center rounded-full bg-superficie text-tinta hover:bg-papel disabled:opacity-40"
        >
          <Minus aria-hidden="true" className="size-4" />
        </button>
        <output aria-live="polite" className="num w-7 text-center font-display text-2xl font-bold text-tinta">{valor}</output>
        <button
          type="button"
          onClick={() => aoMudar(Math.min(20, valor + 1))}
          aria-label={`Aumentar ${rotulo}`}
          className="inline-flex size-10 items-center justify-center rounded-full bg-marca text-sobre-marca hover:bg-marca-forte"
        >
          <Plus aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
