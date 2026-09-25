/*
 * Grupo de opções exclusivas (radio) com visual de botões.
 * Usado no seletor de tipo de acesso, no pé dominante e nas escalas do check-in.
 */
import type { ReactNode } from 'react';
import { MensagemErro } from './Campo';

interface Opcao<T extends string | number> {
  valor: T;
  rotulo: ReactNode;
  descricao?: string;
}

interface Props<T extends string | number> {
  nome: string;
  legenda: string;
  opcoes: Opcao<T>[];
  valor: T | null;
  aoMudar: (valor: T) => void;
  erro?: string;
  legendaOculta?: boolean;
  extremos?: [string, string];
  colunas?: number;
}

export function Escolha<T extends string | number>({
  nome, legenda, opcoes, valor, aoMudar, erro, legendaOculta, extremos, colunas,
}: Props<T>) {
  const idErro = `${nome}-erro`;
  const idExtremos = `${nome}-extremos`;
  const descritos = [extremos ? idExtremos : '', erro ? idErro : ''].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset aria-describedby={descritos} aria-invalid={erro ? true : undefined}>
      <legend className={legendaOculta ? 'sr-only' : 'text-sm font-semibold text-tinta'}>{legenda}</legend>
      <div
        className={`grid gap-1.5 ${legendaOculta ? '' : 'mt-2'}`}
        style={{ gridTemplateColumns: `repeat(${colunas ?? opcoes.length}, minmax(0, 1fr))` }}
      >
        {opcoes.map((opcao) => (
          <label
            key={String(opcao.valor)}
            className={
              'flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-2xl border px-2 py-1.5 text-center text-sm font-semibold transition-colors ' +
              'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foco ' +
              (valor === opcao.valor
                ? 'border-marca bg-marca text-sobre-marca'
                : `${erro ? 'border-erro' : 'border-linha'} bg-superficie-2 text-tinta hover:border-tinta-suave`)
            }
          >
            <input
              type="radio"
              className="sr-only"
              name={nome}
              value={String(opcao.valor)}
              checked={valor === opcao.valor}
              onChange={() => aoMudar(opcao.valor)}
            />
            <span>{opcao.rotulo}</span>
            {opcao.descricao && <span className="text-xs font-normal">{opcao.descricao}</span>}
          </label>
        ))}
      </div>
      {extremos && (
        <p id={idExtremos} className="mt-1.5 flex justify-between gap-4 text-sm text-tinta-suave">
          <span>{extremos[0]}</span>
          <span className="text-right">{extremos[1]}</span>
        </p>
      )}
      {erro && <MensagemErro id={idErro}>{erro}</MensagemErro>}
    </fieldset>
  );
}
