import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import { Link, type LinkProps } from 'react-router';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,border-color,transform] active:scale-[0.98] ' +
  'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50';

const variantes = {
  primario: 'bg-marca text-sobre-marca hover:bg-marca-forte',
  acento: 'bg-acento text-sobre-acento hover:bg-acento-forte',
  marca: 'bg-marca text-sobre-marca hover:bg-marca-forte active:bg-marca-forte',
  contorno: 'border-2 border-tinta/15 bg-superficie text-tinta hover:border-tinta',
  claro: 'bg-white text-cromo shadow-folha hover:bg-white/90',
  escuro: 'bg-tinta text-papel hover:bg-tinta/85',
  fantasma: 'text-realce hover:bg-realce-suave',
  perigo: 'border border-erro/40 bg-superficie text-erro hover:bg-erro-suave',
};

const tamanhos = {
  lg: 'min-h-13 px-6 text-lg',
  md: 'min-h-11 px-5 text-base',
  sm: 'min-h-9 px-3.5 text-sm',
};

export type VarianteBotao = keyof typeof variantes;
export type TamanhoBotao = keyof typeof tamanhos;

interface Estilo {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
}

export function classesBotao(variante: VarianteBotao = 'primario', tamanho: TamanhoBotao = 'md', extra = '') {
  return `${base} ${variantes[variante]} ${tamanhos[tamanho]} ${extra}`.trim();
}

/**
 * Em prévias que bloqueiam o envio nativo de formulários (iframe sem "allow-forms"),
 * o clique no botão de envio não dispararia o onSubmit. Por isso o botão de envio
 * dispara o evento "submit" ele mesmo, e o formulário continua funcionando em qualquer lugar.
 */
function enviarFormulario(evento: MouseEvent<HTMLButtonElement>) {
  const formulario = evento.currentTarget.form;
  if (!formulario || evento.defaultPrevented) return;
  evento.preventDefault();
  formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

export function Botao({ variante, tamanho, className, type = 'button', onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & Estilo) {
  return (
    <button
      type={type}
      className={classesBotao(variante, tamanho, className)}
      onClick={(evento) => {
        onClick?.(evento);
        if (type === 'submit') enviarFormulario(evento);
      }}
      {...props}
    />
  );
}

export function LinkBotao({ variante, tamanho, className, ...props }: LinkProps & Estilo) {
  return <Link className={classesBotao(variante, tamanho, typeof className === 'string' ? className : '')} {...props} />;
}
