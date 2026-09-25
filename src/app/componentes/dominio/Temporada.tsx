import { Goal, Handshake, Lock, Shield, ShieldCheck } from 'lucide-react';
import type { Atleta, Jogo } from '../../tipos';
import { dataCurta } from '../../lib/datas';
import { totaisDoAtleta } from '../../lib/desempenho';
import { Secao } from '../ui/Cartao';
import { Nuvens } from '../layout/Marca';

/** Estatísticas de jogo lançadas pelo técnico. Só atletas da academia e a equipe veem. */
export function Temporada({ atleta, jogos, liberado, resumo = false }: { atleta: Atleta; jogos: Jogo[]; liberado: boolean; resumo?: boolean }) {
  if (!liberado) {
    return (
      <Secao titulo="Jogos da temporada">
        <p className="flex items-start gap-2 text-tinta-suave">
          <Lock aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          As estatísticas de jogo ficam visíveis para atletas da Pelé Academia e para a equipe técnica.
        </p>
      </Secao>
    );
  }
  const totais = totaisDoAtleta(atleta.id, jogos);
  const participou = jogos
    .filter((j) => j.estatisticas.some((e) => e.atletaId === atleta.id))
    .sort((a, b) => b.data.localeCompare(a.data));
  const goleiro = atleta.posicao === 'Goleiro';
  const blocos = [
    { rotulo: 'Gols', valor: totais.gols, icone: Goal },
    { rotulo: 'Assistências', valor: totais.assistencias, icone: Handshake },
    goleiro ? { rotulo: 'Defesas', valor: totais.defesas, icone: ShieldCheck } : { rotulo: 'Desarmes', valor: totais.desarmes, icone: Shield },
  ];

  return (
    <>
      <section aria-labelledby={`temporada-${atleta.id}`} className="relative isolate min-w-0 overflow-hidden rounded-xl bg-marca-forte p-5 text-sobre-marca md:p-6">
        <Nuvens estrelas={false} />
        <h2 id={`temporada-${atleta.id}`} className="text-2xl">Temporada</h2>
        <p className="num mt-1 text-4xl font-semibold tracking-tight">
          {totais.jogos} <span className="text-lg font-medium">{totais.jogos === 1 ? 'jogo' : 'jogos'}</span>
        </p>
        <ul className="mt-4 grid grid-cols-3 gap-2 md:gap-3">
          {blocos.map(({ rotulo, valor, icone: Icone }) => (
            <li key={rotulo} className="rounded-2xl bg-white/10 p-3 md:p-4">
              <span className="inline-flex size-9 items-center justify-center rounded-full bg-white/15">
                <Icone aria-hidden="true" className="size-4.5" />
              </span>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide">{rotulo}</p>
              <p className="num text-2xl font-semibold leading-tight md:text-3xl">{valor}</p>
            </li>
          ))}
        </ul>
      </section>
      {!resumo && participou.length > 0 && (
        <Secao titulo="Jogo a jogo">
          <div className="overflow-x-auto">
            <table className="w-full min-w-md text-left">
              <caption className="sr-only">Estatísticas de {atleta.nome} em cada jogo</caption>
              <thead>
                <tr className="border-b border-linha text-sm text-tinta-suave">
                  <th scope="col" className="py-2 pr-3 font-medium">Jogo</th>
                  <th scope="col" className="px-2 py-2 text-center font-medium">Placar</th>
                  <th scope="col" className="px-2 py-2 text-center font-medium">Gols</th>
                  <th scope="col" className="px-2 py-2 text-center font-medium">Assist.</th>
                  <th scope="col" className="px-2 py-2 text-center font-medium">{goleiro ? 'Defesas' : 'Desarmes'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linha">
                {participou.map((j) => {
                  const e = j.estatisticas.find((x) => x.atletaId === atleta.id)!;
                  return (
                    <tr key={j.id}>
                      <th scope="row" className="py-3 pr-3 font-normal">
                        <span className="block font-medium text-tinta">{j.mando === 'casa' ? 'x' : '@'} {j.adversario}</span>
                        <span className="block text-sm text-tinta-suave">{dataCurta(j.data)}</span>
                      </th>
                      <td className="num px-2 text-center text-tinta-suave">{j.golsPro} x {j.golsContra}</td>
                      <td className="num px-2 text-center text-lg font-semibold text-tinta">{e.gols}</td>
                      <td className="num px-2 text-center text-lg font-semibold text-tinta">{e.assistencias}</td>
                      <td className="num px-2 text-center text-lg font-semibold text-tinta">{goleiro ? e.defesas : e.desarmes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Secao>
      )}
    </>
  );
}
