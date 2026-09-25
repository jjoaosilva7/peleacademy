import type { ReactNode } from 'react';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Gramado } from '../layout/Marca';

/** Rótulo pequeno em caixa alta, usado acima de títulos e números. */
export function Rotulo({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-xs font-bold uppercase tracking-[0.14em] ${className}`}>{children}</p>;
}

/**
 * Estrutura de toda página interna: título grande em caixa alta, descrição,
 * um bloco azul-marinho opcional em destaque e as seções em cartões brancos.
 */
export function Pagina({
  titulo, descricao, acao, voltar, capa, rotulo, children,
}: {
  titulo: ReactNode;
  descricao?: ReactNode;
  acao?: ReactNode;
  voltar?: ReactNode;
  rotulo?: ReactNode;
  capa?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 md:px-8 md:pt-8">
      <header className="flex flex-wrap items-end gap-x-6 gap-y-4">
        {voltar}
        <div className="min-w-0 flex-1 basis-64">
          {rotulo && <Rotulo className="mb-2 text-acento-forte">{rotulo}</Rotulo>}
          <h1 className="text-5xl text-tinta md:text-7xl">{titulo}</h1>
          {descricao && <div className="mt-2 max-w-2xl text-tinta-suave md:text-lg">{descricao}</div>}
        </div>
        {acao && <div className="flex flex-wrap gap-2">{acao}</div>}
      </header>
      {capa && <Vitrine className="mt-6">{capa}</Vitrine>}
      <div className="mt-6 flex flex-col gap-5">{children}</div>
    </div>
  );
}

/** Bloco azul-marinho com as linhas do campo, para o conteúdo principal da tela. */
export function Vitrine({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative isolate overflow-hidden rounded-xl bg-marca p-5 text-sobre-marca md:p-8 ${className}`}>
      <Gramado className="-z-10 text-sobre-marca/8" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-16 -z-10 size-72 rounded-full bg-acento/25 blur-3xl" />
      {children}
    </div>
  );
}

/** Cartão branco de conteúdo. */
export function Secao({ titulo, descricao, acao, children, className = '' }: { titulo?: string; descricao?: ReactNode; acao?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-xl bg-superficie p-5 shadow-folha md:p-6 ${className}`}>
      {(titulo || acao) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {titulo && <h2 className="text-3xl text-tinta md:text-4xl">{titulo}</h2>}
            {descricao && <p className="mt-1 text-sm text-tinta-suave">{descricao}</p>}
          </div>
          {acao}
        </div>
      )}
      {children}
    </section>
  );
}

/**
 * Bloco colorido com o canto superior direito "recortado" e uma seta,
 * como nas vitrines de produto. Cores: branco, céu, ouro ou marinho.
 */
const TONS_BLOCO = {
  branco: 'bg-superficie text-tinta',
  ceu: 'bg-ceu-claro text-tinta',
  ouro: 'bg-acento text-sobre-acento',
  marinho: 'bg-marca text-sobre-marca',
};

export function Bloco({ tom = 'branco', seta = false, children, className = '' }: { tom?: keyof typeof TONS_BLOCO; seta?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-xl p-5 ${TONS_BLOCO[tom]} ${className}`}>
      {seta && (
        <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 inline-flex size-12 items-center justify-center rounded-full bg-papel">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-tinta text-papel">
            <ArrowUpRight className="size-4" />
          </span>
        </span>
      )}
      {children}
    </div>
  );
}

/** Número grande com a parte decimal mais clara (ex.: 7,9 ou 14,5). */
export function NumeroGrande({ valor }: { valor: ReactNode }) {
  if (typeof valor !== 'string' && typeof valor !== 'number') return <>{valor}</>;
  const texto = String(valor);
  const partes = /^(-?\d+)([,.]\d+)$/.exec(texto);
  if (!partes) return <>{texto}</>;
  return (
    <>
      {partes[1]}
      <span className="opacity-70">{partes[2]}</span>
    </>
  );
}

export type CorAnel = 'verde' | 'rosa' | 'azul' | 'coral' | 'amarelo' | 'lilas';

/** Anel de progresso decorativo (o valor sempre aparece em texto). */
export function Anel({ valor, cor = 'azul', tamanho = 44, trilha = 'var(--color-superficie)' }: { valor: number; cor?: CorAnel; tamanho?: number; trilha?: string }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, valor));
  return (
    <svg aria-hidden="true" viewBox="0 0 44 44" width={tamanho} height={tamanho} className="-rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke={trilha} strokeWidth="5" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={`var(--anel-${cor})`} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${v * c} ${c}`} />
    </svg>
  );
}

/** Bloco de estatística: ícone, anel opcional, número grande e rótulo em caixa alta. */
export function Indicador({
  rotulo, valor, detalhe, unidade, icone: Icone, progresso, cor,
}: { rotulo: string; valor: ReactNode; detalhe?: ReactNode; unidade?: string; icone?: LucideIcon; progresso?: number; cor?: CorAnel }) {
  return (
    <div className="relative min-w-0 rounded-lg bg-superficie-2 p-4">
      <div className="flex items-start justify-between gap-2">
        {Icone ? (
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-superficie text-tinta">
            <Icone aria-hidden="true" className="size-5" />
          </span>
        ) : <span />}
        {progresso !== undefined && <Anel valor={progresso} cor={cor} />}
      </div>
      <p className="num mt-3 font-display text-5xl font-extrabold leading-none text-tinta">
        <NumeroGrande valor={valor} />
        {unidade && <span className="ml-1 font-sans text-base font-semibold normal-case text-tinta-suave">{unidade}</span>}
      </p>
      <Rotulo className="mt-2 text-tinta-suave">{rotulo}</Rotulo>
      {detalhe && <div className="mt-1 text-sm text-tinta-suave">{detalhe}</div>}
    </div>
  );
}

/** Grade de indicadores dentro de um cartão branco. */
export function FaixaIndicadores({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 rounded-xl bg-superficie p-3 shadow-folha md:grid-cols-4">{children}</div>;
}

/** Botão de ação em pílula com ícone num círculo (ex.: "Fazer check-in"). */
export function AcaoRapida({ icone: Icone, children }: { icone: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex size-7 items-center justify-center rounded-full border border-current/30">
        <Icone aria-hidden="true" className="size-4" />
      </span>
      {children}
    </span>
  );
}
