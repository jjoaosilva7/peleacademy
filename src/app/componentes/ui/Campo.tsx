import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { CircleAlert, type LucideIcon } from 'lucide-react';

interface BaseCampo {
  id: string;
  rotulo: string;
  erro?: string;
  dica?: ReactNode;
  opcional?: boolean;
}

function classeEntrada(temErro: boolean) {
  return (
    'mt-1.5 block w-full rounded-2xl border bg-superficie-2 px-4 text-base text-tinta placeholder:text-tinta-suave ' +
    'disabled:cursor-not-allowed disabled:bg-superficie-2 ' +
    (temErro ? 'border-erro' : 'border-transparent hover:border-linha')
  );
}

function descritores(id: string, erro?: string, dica?: ReactNode) {
  return [dica ? `${id}-dica` : '', erro ? `${id}-erro` : ''].filter(Boolean).join(' ') || undefined;
}

function Rotulo({ id, rotulo, opcional }: Pick<BaseCampo, 'id' | 'rotulo' | 'opcional'>) {
  return (
    <label htmlFor={id} className="block text-sm font-semibold text-tinta">
      {rotulo}
      {opcional && <span className="font-normal text-tinta-suave"> (opcional)</span>}
    </label>
  );
}

export function MensagemErro({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-erro">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function Rodape({ id, erro, dica }: Pick<BaseCampo, 'id' | 'erro' | 'dica'>) {
  return (
    <>
      {dica && <p id={`${id}-dica`} className="mt-1.5 text-sm text-tinta-suave">{dica}</p>}
      {erro && <MensagemErro id={`${id}-erro`}>{erro}</MensagemErro>}
    </>
  );
}

export function CampoTexto({
  id, rotulo, erro, dica, opcional, className = '', espacoDireita = false, icone: Icone, ...props
}: BaseCampo & InputHTMLAttributes<HTMLInputElement> & { espacoDireita?: boolean; icone?: LucideIcon }) {
  return (
    <div className={className}>
      <Rotulo id={id} rotulo={rotulo} opcional={opcional} />
      <div className="relative">
        {Icone && <Icone aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-tinta-suave" />}
        <input
          id={id}
          name={id}
          aria-invalid={erro ? true : undefined}
          aria-describedby={descritores(id, erro, dica)}
          className={`${classeEntrada(Boolean(erro))} min-h-11 ${espacoDireita ? 'pr-12' : ''} ${Icone ? 'pl-12' : ''}`}
          {...props}
        />
      </div>
      <Rodape id={id} erro={erro} dica={dica} />
    </div>
  );
}

export function CampoSelecao({ id, rotulo, erro, dica, opcional, className = '', children, ...props }: BaseCampo & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={className}>
      <Rotulo id={id} rotulo={rotulo} opcional={opcional} />
      <select
        id={id}
        name={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descritores(id, erro, dica)}
        className={`${classeEntrada(Boolean(erro))} min-h-11`}
        {...props}
      >
        {children}
      </select>
      <Rodape id={id} erro={erro} dica={dica} />
    </div>
  );
}

export function CampoAreaTexto({ id, rotulo, erro, dica, opcional, className = '', ...props }: BaseCampo & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      <Rotulo id={id} rotulo={rotulo} opcional={opcional} />
      <textarea
        id={id}
        name={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descritores(id, erro, dica)}
        className={`${classeEntrada(Boolean(erro))} py-2`}
        {...props}
      />
      <Rodape id={id} erro={erro} dica={dica} />
    </div>
  );
}
