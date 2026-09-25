import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

/** Janela modal com o elemento <dialog> nativo: prende o foco e fecha com Esc. */
export function Dialogo({ aberto, aoFechar, titulo, children }: { aberto: boolean; aoFechar: () => void; titulo: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="titulo-dialogo"
      onClose={aoFechar}
      onCancel={aoFechar}
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-xl bg-superficie p-0 text-tinta shadow-2xl backdrop:bg-cromo/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-5">
        <h2 id="titulo-dialogo" className="text-2xl">{titulo}</h2>
        <button type="button" onClick={aoFechar} aria-label="Fechar" className="inline-flex size-10 items-center justify-center rounded-full bg-superficie-2 text-tinta-suave hover:bg-superficie-2 hover:text-tinta">
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
      <div className="max-h-[75dvh] overflow-y-auto p-5">{children}</div>
    </dialog>
  );
}
