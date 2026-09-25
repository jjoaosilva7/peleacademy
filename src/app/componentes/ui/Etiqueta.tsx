import type { ReactNode } from 'react';

const tons = {
  neutro: 'bg-superficie-2 text-tinta-suave',
  marca: 'bg-realce-suave text-realce',
  acento: 'bg-acento text-sobre-acento',
  sucesso: 'bg-sucesso-suave text-sucesso',
  atencao: 'bg-atencao-suave text-atencao',
  erro: 'bg-erro-suave text-erro',
};

export type TomEtiqueta = keyof typeof tons;

export function Etiqueta({ tom = 'neutro', children, className = '' }: { tom?: TomEtiqueta; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide [overflow-wrap:anywhere] ${tons[tom]} ${className}`}>
      {children}
    </span>
  );
}
