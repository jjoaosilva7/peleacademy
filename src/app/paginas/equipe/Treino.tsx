/*
 * Avaliação rápida do treino: o olheiro marca estatísticas e pontos a melhorar de cada atleta
 * e a nota (base 6,5) é calculada na hora, no estilo dos apps de estatística de futebol.
 */
import { useState } from 'react';
import { ChevronDown, ClipboardList } from 'lucide-react';
import { useEstado } from '../../estado/EstadoApp';
import { useDesempenho } from '../../estado/useDesempenho';
import type { Atleta, Categoria, Falha, RegistroTreino, StatTreino } from '../../tipos';
import { dataLonga } from '../../lib/datas';
import { CATEGORIAS, categoriaDoAtleta } from '../../lib/regras';
import {
  atributosAtuais, calcularNotaTreino, calcularOverall, FALHAS, SETOR_DA_POSICAO, SIGLA_POSICAO, STATS, STATS_POR_POSICAO,
  type Setor,
} from '../../lib/desempenho';
import { formatarNumero, plural } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { Botao } from '../../componentes/ui/Botao';
import { Pagina, Secao } from '../../componentes/ui/Cartao';
import { CampoSelecao } from '../../componentes/ui/Campo';
import { Escolha } from '../../componentes/ui/Escolha';
import { Vazio } from '../../componentes/ui/Vazio';
import { useAviso } from '../../componentes/ui/Aviso';
import { Contador } from '../../componentes/dominio/Contador';
import { FotoJogador } from '../../componentes/dominio/FotoJogador';
import { NotaChip } from '../../componentes/dominio/NotaChip';

interface Rascunho {
  participou: boolean;
  stats: Partial<Record<StatTreino, number>>;
  falhas: Falha[];
  ajuste: number;
}

const AJUSTES = [-1, -0.5, 0, 0.5, 1].map((v) => ({
  valor: v,
  rotulo: v === 0 ? '0' : `${v > 0 ? '+' : '−'}${formatarNumero(Math.abs(v))}`,
}));

const TODAS_STATS = Object.keys(STATS) as StatTreino[];
const ORDEM_SETOR: Setor[] = ['GOL', 'DEF', 'MEI', 'ATA'];

export function Treino() {
  useTitulo('Avaliar treino');
  const { db, hoje, salvarTreino } = useEstado();
  const { overall } = useDesempenho();
  const avisar = useAviso();

  const categoriasComAtletas = CATEGORIAS.filter((c) => db.atletas.some((a) => a.status === 'academia' && categoriaDoAtleta(a, hoje) === c));
  const [categoria, setCategoria] = useState<Categoria>(categoriasComAtletas.includes('Sub-17') ? 'Sub-17' : categoriasComAtletas[0]);
  const elencoDe = (cat: Categoria) =>
    db.atletas
      .filter((a) => a.status === 'academia' && categoriaDoAtleta(a, hoje) === cat)
      .sort((a, b) => ORDEM_SETOR.indexOf(SETOR_DA_POSICAO[a.posicao]) - ORDEM_SETOR.indexOf(SETOR_DA_POSICAO[b.posicao]) || a.nome.localeCompare(b.nome));
  const elenco = elencoDe(categoria);

  /** Carrega o treino já salvo hoje (para corrigir) ou começa um rascunho vazio com todos presentes. */
  const rascunhoInicial = (cat: Categoria) => {
    const salvo = db.treinos.find((t) => t.data === hoje && t.categoria === cat);
    const mapa: Record<string, Rascunho> = {};
    for (const a of elencoDe(cat)) {
      const r = salvo?.registros.find((x) => x.atletaId === a.id);
      mapa[a.id] = r ? { participou: true, stats: { ...r.stats }, falhas: [...r.falhas], ajuste: r.ajuste } : { participou: !salvo, stats: {}, falhas: [], ajuste: 0 };
    }
    return mapa;
  };
  const [rascunhos, setRascunhos] = useState<Record<string, Rascunho>>(() => rascunhoInicial(categoria));
  const [aberto, setAberto] = useState<string | null>(null);
  const [maisStats, setMaisStats] = useState(false);
  const jaSalvo = db.treinos.some((t) => t.data === hoje && t.categoria === categoria);

  function trocarCategoria(nova: Categoria) {
    setCategoria(nova);
    setRascunhos(rascunhoInicial(nova));
    setAberto(null);
  }

  function atualizar(id: string, mudanca: (r: Rascunho) => Rascunho) {
    setRascunhos((atual) => ({ ...atual, [id]: mudanca(atual[id]) }));
  }

  const participantes = elenco.filter((a) => rascunhos[a.id]?.participou);

  function salvar() {
    const registros: RegistroTreino[] = participantes.map((a) => {
      const r = rascunhos[a.id];
      const stats = Object.fromEntries(Object.entries(r.stats).filter(([, v]) => (v ?? 0) > 0));
      return { atletaId: a.id, stats, falhas: r.falhas, ajuste: r.ajuste };
    });
    const novosTreinos = [
      ...db.treinos.filter((t) => !(t.data === hoje && t.categoria === categoria)),
      { id: 'previa', data: hoje, categoria, avaliador: '', registros },
    ];
    let subiram = 0;
    let cairam = 0;
    for (const a of participantes) {
      const depois = calcularOverall(atributosAtuais(a, novosTreinos), a.posicao);
      if (depois > overall(a)) subiram += 1;
      if (depois < overall(a)) cairam += 1;
    }
    salvarTreino(categoria, registros);
    const melhor = [...registros].sort((x, y) => calcularNotaTreino(y) - calcularNotaTreino(x))[0];
    const destaque = melhor && elenco.find((a) => a.id === melhor.atletaId);
    avisar(
      `Treino salvo com ${registros.length} atletas.${destaque ? ` Destaque: ${destaque.apelido || destaque.nome}, ${formatarNumero(calcularNotaTreino(melhor))}.` : ''} Overall: ${plural(subiram, 'subiu', 'subiram')}, ${plural(cairam, 'caiu', 'caíram')}.`,
      'sucesso',
    );
  }

  return (
    <Pagina
      titulo="Avaliar treino"
      descricao={`${dataLonga(hoje)}. Toque no atleta, marque os números e o que ele errou. A nota começa em 6,5 e muda na hora.`}
    >
      <Secao>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <CampoSelecao id="categoria-treino" rotulo="Categoria" value={categoria} onChange={(e) => trocarCategoria(e.target.value as Categoria)} className="w-full sm:w-56">
            {categoriasComAtletas.map((c) => <option key={c} value={c}>{c}</option>)}
          </CampoSelecao>
          <p className="text-tinta-suave">
            {jaSalvo ? 'Treino de hoje já salvo. Você pode corrigir e salvar de novo.' : `${participantes.length} de ${elenco.length} atletas marcados como presentes.`}
          </p>
        </div>
      </Secao>

      <ListaTreino
        elenco={elenco}
        rascunhos={rascunhos}
        aberto={aberto}
        setAberto={setAberto}
        maisStats={maisStats}
        setMaisStats={setMaisStats}
        atualizar={atualizar}
      />

      {elenco.length > 0 && (
        <div className="sticky z-20 flex items-center justify-between gap-3 rounded-full bg-cromo py-2 pl-5 pr-2 text-white shadow-2xl bottom-28 md:bottom-6">
          <p className="text-sm font-semibold md:text-base">{participantes.length} atletas no treino</p>
          <Botao variante="primario" onClick={salvar} disabled={participantes.length === 0}>
            {jaSalvo ? 'Salvar alterações' : 'Salvar treino'}
          </Botao>
        </div>
      )}
    </Pagina>
  );
}

interface PropsLista {
  elenco: Atleta[];
  rascunhos: Record<string, Rascunho>;
  aberto: string | null;
  setAberto: (id: string | null) => void;
  maisStats: boolean;
  setMaisStats: (v: boolean) => void;
  atualizar: (id: string, mudanca: (r: Rascunho) => Rascunho) => void;
}

function ListaTreino({ elenco, rascunhos, aberto, setAberto, maisStats, setMaisStats, atualizar }: PropsLista) {
  if (elenco.length === 0) {
    return <Vazio icone={ClipboardList} titulo="Nenhum atleta nesta categoria" />;
  }

  function proximo(indice: number) {
    const seguinte = elenco.slice(indice + 1).find((a) => rascunhos[a.id]?.participou);
    setAberto(seguinte?.id ?? null);
    if (seguinte) requestAnimationFrame(() => document.getElementById(`atleta-treino-${seguinte.id}`)?.focus());
  }

  return (
    <Secao titulo="Atletas" descricao="Desmarque quem não treinou hoje.">
      <ul className="divide-y divide-linha">
        {elenco.map((atleta, indice) => {
          const r = rascunhos[atleta.id] ?? { participou: true, stats: {}, falhas: [], ajuste: 0 };
          const nota = calcularNotaTreino(r);
          const expandido = aberto === atleta.id;
          const resumo = (Object.entries(r.stats) as [StatTreino, number][])
            .filter(([, v]) => v > 0)
            .map(([s, v]) => `${v} ${(v === 1 ? STATS[s].singular : STATS[s].nome).toLowerCase()}`)
            .join(', ');
          const statsVisiveis = maisStats && expandido ? TODAS_STATS : STATS_POR_POSICAO[atleta.posicao];

          return (
            <li key={atleta.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <label className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-superficie-2">
                  <input
                    type="checkbox"
                    checked={r.participou}
                    onChange={(e) => atualizar(atleta.id, (x) => ({ ...x, participou: e.target.checked }))}
                    className="size-5 accent-marca"
                    aria-label={`${atleta.apelido || atleta.nome} treinou hoje`}
                  />
                </label>
                <button
                  id={`atleta-treino-${atleta.id}`}
                  type="button"
                  onClick={() => setAberto(expandido ? null : atleta.id)}
                  aria-expanded={expandido}
                  aria-controls={`painel-treino-${atleta.id}`}
                  disabled={!r.participou}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left hover:bg-superficie-2 disabled:opacity-45"
                >
                  <FotoJogador atleta={atleta} tamanho="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-xl font-bold text-tinta">
                      {atleta.apelido || atleta.nome}
                      <span className="ml-2 font-sans text-sm font-semibold text-tinta-suave">{SIGLA_POSICAO[atleta.posicao]}</span>
                    </span>
                    <span className="block truncate text-sm text-tinta-suave">
                      {r.participou ? resumo || (r.falhas.length ? `${r.falhas.length} ponto(s) a melhorar` : 'Sem marcações') : 'Não treinou'}
                    </span>
                  </span>
                  {r.participou && <NotaChip nota={nota} animar rotulo="Nota do treino" />}
                  <ChevronDown aria-hidden="true" className={`size-5 shrink-0 text-tinta-suave transition-transform ${expandido ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {expandido && r.participou && (
                <div id={`painel-treino-${atleta.id}`} className="mt-3 flex flex-col gap-5 rounded-2xl bg-superficie-2/60 p-4 md:ml-14">
                  <div>
                    <h3 className="text-lg text-tinta">Números</h3>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {statsVisiveis.map((stat) => (
                        <Contador
                          key={stat}
                          id={`${atleta.id}-${stat}`}
                          rotulo={STATS[stat].nome}
                          negativo={STATS[stat].peso < 0}
                          valor={r.stats[stat] ?? 0}
                          aoMudar={(v) => atualizar(atleta.id, (x) => ({ ...x, stats: { ...x.stats, [stat]: v } }))}
                        />
                      ))}
                    </div>
                    <Botao variante="fantasma" tamanho="sm" className="mt-2" onClick={() => setMaisStats(!maisStats)} aria-expanded={maisStats}>
                      {maisStats ? 'Mostrar só as principais' : 'Mais estatísticas'}
                    </Botao>
                  </div>

                  <fieldset>
                    <legend className="text-lg font-display font-bold text-tinta">Onde está pecando</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(Object.keys(FALHAS) as Falha[]).map((f) => {
                        const marcada = r.falhas.includes(f);
                        return (
                          <button
                            key={f}
                            type="button"
                            aria-pressed={marcada}
                            onClick={() => atualizar(atleta.id, (x) => ({ ...x, falhas: marcada ? x.falhas.filter((y) => y !== f) : [...x.falhas, f] }))}
                            className={`min-h-11 rounded-full border px-3.5 font-semibold transition-colors ${marcada ? 'border-nota-regular bg-nota-regular text-sobre-acento' : 'border-linha bg-superficie text-tinta hover:border-tinta-suave'}`}
                          >
                            {FALHAS[f].nome}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <Escolha
                    nome={`ajuste-${atleta.id}`}
                    legenda="Ajuste do treinador"
                    valor={r.ajuste}
                    aoMudar={(v) => atualizar(atleta.id, (x) => ({ ...x, ajuste: v }))}
                    opcoes={AJUSTES}
                    extremos={['Abaixo do esperado', 'Destaque do treino']}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-linha pt-4">
                    <p className="flex items-center gap-2 text-tinta">
                      Nota do treino <NotaChip nota={nota} tamanho="lg" animar />
                    </p>
                    <Botao variante="marca" onClick={() => proximo(indice)}>Próximo atleta</Botao>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Secao>
  );
}
