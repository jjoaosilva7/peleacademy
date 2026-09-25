import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { Atleta } from '../../tipos';
import { calcularIdade, categoriaDoAtleta } from '../../lib/regras';
import { faixaDoCartao, SIGLA_POSICAO } from '../../lib/desempenho';
import { Etiqueta } from '../ui/Etiqueta';
import { FotoJogador } from './FotoJogador';

const COR_OVERALL = { elite: 'bg-acento text-sobre-acento', destaque: 'bg-marca text-sobre-marca', base: 'bg-superficie-2 text-tinta' };

interface Props {
  atleta: Atleta;
  hoje: string;
  destino: string;
  overall?: number;
  acao?: ReactNode;
  extra?: ReactNode;
}

/** Linha de atleta para listas: foto 3x4, overall, nome, apelido e posição. */
export function LinhaAtleta({ atleta, hoje, destino, overall, acao, extra }: Props) {
  return (
    <article className="flex items-center gap-4 py-4">
      <FotoJogador atleta={atleta} tamanho="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {overall !== undefined && (
            <span className={`num inline-flex h-7 min-w-9 items-center justify-center rounded-full px-2 text-base font-semibold ${COR_OVERALL[faixaDoCartao(overall)]}`} aria-label={`Overall ${overall}`}>
              {overall}
            </span>
          )}
          <h3 className="min-w-0 truncate text-lg leading-tight">
            <Link to={destino} className="text-tinta underline-offset-4 hover:text-realce hover:underline">
              {atleta.apelido || atleta.nome}
            </Link>
          </h3>
        </div>
        <p className="truncate text-tinta-suave">
          {atleta.apelido && <>{atleta.nome}. </>}
          <abbr title={atleta.posicao} className="no-underline">{SIGLA_POSICAO[atleta.posicao]}</abbr>, {calcularIdade(atleta.nascimento, hoje)} anos, {categoriaDoAtleta(atleta, hoje)}. {atleta.cidade} ({atleta.uf})
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {atleta.status === 'academia' ? <Etiqueta tom="acento">Pelé Academia</Etiqueta> : <Etiqueta>Candidato</Etiqueta>}
          {extra}
        </div>
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </article>
  );
}
