/*
 * Montagem de times: o treinador escolhe quem está presente e quantos times quer.
 * O app distribui setor por setor para os times ficarem mesclados por posição e por nota.
 */
import { useState } from 'react';
import { Shuffle, UsersRound } from 'lucide-react';
import { useEstado } from '../../estado/EstadoApp';
import { useDesempenho } from '../../estado/useDesempenho';
import type { Atleta, Categoria } from '../../tipos';
import { CATEGORIAS, categoriaDoAtleta, checkinDoDia } from '../../lib/regras';
import { mediaOverall, montarTimes, NOME_SETOR, SETOR_DA_POSICAO, SIGLA_POSICAO, type Setor } from '../../lib/desempenho';
import { formatarNumero } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { Botao } from '../../componentes/ui/Botao';
import { Pagina, Secao } from '../../componentes/ui/Cartao';
import { CampoSelecao } from '../../componentes/ui/Campo';
import { Escolha } from '../../componentes/ui/Escolha';
import { Vazio } from '../../componentes/ui/Vazio';
import { useAviso } from '../../componentes/ui/Aviso';
import { FotoJogador } from '../../componentes/dominio/FotoJogador';

const NOMES_TIMES = ['Azul', 'Amarelo', 'Areia', 'Branco'];
const CORES_TIMES = ['bg-marca text-sobre-marca', 'bg-acento text-sobre-acento', 'bg-superficie-2 text-tinta', 'bg-superficie text-tinta border border-linha'];
const ORDEM_SETOR: Setor[] = ['GOL', 'DEF', 'MEI', 'ATA'];

export function Times() {
  useTitulo('Montar times');
  const { db, hoje } = useEstado();
  const { overall } = useDesempenho();
  const avisar = useAviso();

  const categoriasComAtletas = CATEGORIAS.filter((c) => db.atletas.some((a) => a.status === 'academia' && categoriaDoAtleta(a, hoje) === c));
  const [categoria, setCategoria] = useState<Categoria>(categoriasComAtletas.includes('Sub-17') ? 'Sub-17' : categoriasComAtletas[0]);
  const elenco = db.atletas.filter((a) => a.status === 'academia' && categoriaDoAtleta(a, hoje) === categoria);
  const [presentes, setPresentes] = useState<Set<string>>(() => new Set(elenco.map((a) => a.id)));
  const [quantidade, setQuantidade] = useState(2);
  const [times, setTimes] = useState<string[][] | null>(null);
  const [rodada, setRodada] = useState(0);

  const porId = new Map(db.atletas.map((a) => [a.id, a]));
  const overallDe = (id: string) => overall(porId.get(id)!);

  function trocarCategoria(nova: Categoria) {
    setCategoria(nova);
    setPresentes(new Set(db.atletas.filter((a) => a.status === 'academia' && categoriaDoAtleta(a, hoje) === nova).map((a) => a.id)));
    setTimes(null);
  }

  function alternarPresenca(id: string) {
    setPresentes((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function gerar(semente: number) {
    const jogadores = elenco.filter((a) => presentes.has(a.id)).map((a) => ({ id: a.id, posicao: a.posicao, overall: overall(a) }));
    if (jogadores.length < quantidade * 2) {
      avisar(`Selecione pelo menos ${quantidade * 2} atletas para montar ${quantidade} times.`, 'erro');
      return;
    }
    const novos = montarTimes(jogadores, quantidade, semente);
    setTimes(novos);
    setRodada(semente);
    const medias = novos.map((t) => mediaOverall(t, overallDe));
    avisar(`Times montados. Diferença de overall médio: ${formatarNumero(Math.max(...medias) - Math.min(...medias))}.`, 'sucesso');
  }

  function mover(id: string, destino: number) {
    if (!times) return;
    setTimes(times.map((t, i) => (i === destino ? [...t.filter((x) => x !== id), id] : t.filter((x) => x !== id))));
  }

  const medias = times?.map((t) => mediaOverall(t, overallDe)) ?? [];
  const diferenca = medias.length ? Math.max(...medias) - Math.min(...medias) : 0;

  return (
    <Pagina titulo="Montar times" descricao="Marque quem está no treino. O app mistura goleiros, defesa, meio e ataque e equilibra o overall de cada time.">
      <Secao>
        <div className="grid gap-5 md:grid-cols-2">
          <CampoSelecao id="categoria-times" rotulo="Categoria" value={categoria} onChange={(e) => trocarCategoria(e.target.value as Categoria)}>
            {categoriasComAtletas.map((c) => <option key={c} value={c}>{c}</option>)}
          </CampoSelecao>
          <Escolha nome="quantidade-times" legenda="Quantos times" valor={quantidade} aoMudar={setQuantidade} opcoes={[2, 3, 4].map((n) => ({ valor: n, rotulo: n }))} />
        </div>
      </Secao>

      {!times ? (
        <Secao titulo={`Presentes (${presentes.size})`} descricao="Quem fez check-in hoje aparece marcado com um ponto amarelo." acao={
          <Botao variante="marca" onClick={() => gerar(0)}>
            <UsersRound aria-hidden="true" className="size-5" />
            Montar times
          </Botao>
        }>
          {elenco.length === 0 ? (
            <Vazio icone={UsersRound} titulo="Nenhum atleta nesta categoria" />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {elenco
                .sort((a, b) => ORDEM_SETOR.indexOf(SETOR_DA_POSICAO[a.posicao]) - ORDEM_SETOR.indexOf(SETOR_DA_POSICAO[b.posicao]) || overall(b) - overall(a))
                .map((a) => (
                  <li key={a.id}>
                    <label className={`flex cursor-pointer items-center gap-3 rounded-md border p-2 pr-3 ${presentes.has(a.id) ? 'border-marca bg-realce-suave' : 'border-linha'} has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-foco`}>
                      <input type="checkbox" className="sr-only" checked={presentes.has(a.id)} onChange={() => alternarPresenca(a.id)} />
                      <FotoJogador atleta={a} tamanho="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 truncate font-semibold text-tinta">
                          {a.apelido || a.nome}
                          {checkinDoDia(a, hoje) && <span role="img" className="size-2 shrink-0 rounded-full bg-acento-forte" aria-label="fez check-in hoje" />}
                        </span>
                        <span className="block text-sm text-tinta-suave">{SIGLA_POSICAO[a.posicao]}, OVR {overall(a)}</span>
                      </span>
                      <span aria-hidden="true" className={`size-5 shrink-0 rounded-full border-2 ${presentes.has(a.id) ? 'border-marca bg-marca' : 'border-linha'}`} />
                    </label>
                  </li>
                ))}
            </ul>
          )}
        </Secao>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-linha bg-superficie p-4 md:p-5">
            <p className="text-tinta">
              Diferença entre o time mais forte e o mais fraco: <strong className="num font-display text-2xl">{formatarNumero(diferenca)}</strong> de overall médio.
            </p>
            <div className="flex flex-wrap gap-2">
              <Botao variante="contorno" onClick={() => setTimes(null)}>Mudar presentes</Botao>
              <Botao variante="marca" onClick={() => gerar(rodada + 1)}>
                <Shuffle aria-hidden="true" className="size-5" />
                Misturar de novo
              </Botao>
            </div>
          </div>

          <div className={`grid gap-5 md:gap-6 ${quantidade >= 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}>
            {times.map((ids, i) => (
              <Time
                key={i}
                nome={NOMES_TIMES[i]}
                cor={CORES_TIMES[i]}
                media={medias[i]}
                atletas={ids.map((id) => porId.get(id)!)}
                overallDe={overallDe}
                outros={NOMES_TIMES.slice(0, quantidade).map((n, j) => ({ nome: n, indice: j })).filter((t) => t.indice !== i)}
                aoMover={mover}
              />
            ))}
          </div>
        </>
      )}
    </Pagina>
  );
}

interface PropsTime {
  nome: string;
  cor: string;
  media: number;
  atletas: Atleta[];
  overallDe: (id: string) => number;
  outros: { nome: string; indice: number }[];
  aoMover: (id: string, destino: number) => void;
}

function Time({ nome, cor, media, atletas, overallDe, outros, aoMover }: PropsTime) {
  const contagem = ORDEM_SETOR.map((s) => atletas.filter((a) => SETOR_DA_POSICAO[a.posicao] === s).length);
  return (
    <section aria-labelledby={`time-${nome}`} className="overflow-hidden rounded-md border border-linha bg-superficie">
      <header className={`flex items-end justify-between gap-3 px-5 py-4 ${cor}`}>
        <div>
          <h2 id={`time-${nome}`} className="text-3xl">Time {nome}</h2>
          <p className="text-sm font-semibold opacity-85">{contagem.join('-')} ({atletas.length} jogadores)</p>
        </div>
        <p className="text-right">
          <span className="block text-sm font-semibold opacity-85">Overall médio</span>
          <span className="num font-display text-4xl font-bold leading-none">{formatarNumero(media)}</span>
        </p>
      </header>
      <ul className="divide-y divide-linha px-5">
        {ORDEM_SETOR.flatMap((setor) => {
          const doSetor = atletas.filter((a) => SETOR_DA_POSICAO[a.posicao] === setor).sort((a, b) => overallDe(b.id) - overallDe(a.id));
          if (doSetor.length === 0) return [];
          return [
            <li key={setor} className="pb-1 pt-3 text-sm font-semibold text-tinta-suave">{NOME_SETOR[setor]}</li>,
            ...doSetor.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2.5">
                <FotoJogador atleta={a} tamanho="xs" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-tinta">{a.apelido || a.nome}</span>
                  <span className="block text-sm text-tinta-suave">{SIGLA_POSICAO[a.posicao]}</span>
                </span>
                <span className="num font-display text-2xl font-bold text-tinta">{overallDe(a.id)}</span>
                <label className="sr-only" htmlFor={`mover-${a.id}`}>Mover {a.apelido || a.nome} para</label>
                <select
                  id={`mover-${a.id}`}
                  value=""
                  onChange={(e) => e.target.value !== '' && aoMover(a.id, Number(e.target.value))}
                  className="min-h-9 rounded-full border border-linha bg-superficie-2 px-3 text-sm text-tinta"
                >
                  <option value="">Mover</option>
                  {outros.map((o) => <option key={o.indice} value={o.indice}>Time {o.nome}</option>)}
                </select>
              </li>
            )),
          ];
        })}
      </ul>
    </section>
  );
}
