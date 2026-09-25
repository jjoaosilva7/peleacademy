import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import type { Atleta } from '../../tipos';
import { calcularIdade, categoriaDoAtleta } from '../../lib/regras';
import { faixaDoCartao, SIGLA_POSICAO } from '../../lib/desempenho';
import { FotoJogador } from './FotoJogador';

const FUNDOS = ['bg-ceu-claro', 'bg-acento', 'bg-superficie-2', 'bg-marca'];

/**
 * Bloco de atleta no estilo vitrine de produto: foto sobre um fundo colorido,
 * canto recortado com seta, nome, posição e overall.
 */
export function CartaoAtleta({ atleta, hoje, destino, overall, indice = 0, rodape }: { atleta: Atleta; hoje: string; destino: string; overall: number; indice?: number; rodape?: ReactNode }) {
  const fundo = FUNDOS[indice % FUNDOS.length];
  const escuro = fundo === 'bg-marca';
  const faixa = faixaDoCartao(overall);
  const corOverall = faixa === 'elite' ? 'bg-acento text-sobre-acento' : faixa === 'destaque' ? 'bg-marca text-sobre-marca' : 'bg-superficie text-tinta';

  return (
    <article className="group relative flex flex-col rounded-xl bg-superficie p-2 shadow-folha">
      <div className={`relative overflow-hidden rounded-lg ${fundo} pt-4`}>
        <div className="flex justify-center">
          <FotoJogador atleta={atleta} tamanho="lg" className="w-28 rounded-t-md rounded-b-none" fundo={escuro ? 'bg-superficie-2' : 'bg-superficie'} />
        </div>
        <span className={`absolute left-3 top-3 inline-flex min-w-9 items-center justify-center rounded-full px-2 py-0.5 font-display text-lg font-extrabold ${corOverall}`} aria-label={`Overall ${overall}`}>
          {overall}
        </span>
        <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 inline-flex size-12 items-center justify-center rounded-full bg-superficie">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-tinta text-papel transition-transform group-hover:rotate-45">
            <ArrowUpRight className="size-4" />
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-3">
        <h3 className="truncate text-2xl leading-tight">
          <Link to={destino} className="text-tinta after:absolute after:inset-0 after:rounded-xl hover:text-realce focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-foco">
            {atleta.apelido || atleta.nome}
          </Link>
        </h3>
        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-tinta-suave">
          {SIGLA_POSICAO[atleta.posicao]} · {calcularIdade(atleta.nascimento, hoje)} anos · {categoriaDoAtleta(atleta, hoje)}
        </p>
        {rodape && <div className="relative z-10 mt-3 flex flex-wrap items-center gap-1.5">{rodape}</div>}
      </div>
    </article>
  );
}
