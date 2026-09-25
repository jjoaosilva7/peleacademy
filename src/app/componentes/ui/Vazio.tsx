import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export function Vazio({ icone: Icone, titulo, texto, acao }: { icone: LucideIcon; titulo: string; texto?: string; acao?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-8 text-center">
      <Icone aria-hidden="true" className="size-8 text-tinta-suave" />
      <h3 className="mt-3 text-xl text-tinta">{titulo}</h3>
      {texto && <p className="mt-1 max-w-sm text-tinta-suave">{texto}</p>}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}
