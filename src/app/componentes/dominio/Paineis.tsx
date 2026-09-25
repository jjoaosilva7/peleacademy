/*
 * Painéis de análise usados tanto pelo atleta (Minha evolução) quanto pela equipe (ficha do atleta).
 */
import type { Atleta, StatTreino, Treino } from '../../tipos';
import { dataCurta, diaDaSemana, somarDias } from '../../lib/datas';
import {
  ATRIBUTOS_INICIAIS, atributosDaPosicao, calcularOverall, FALHAS, falhasFrequentes, historicoAtributos, STATS, treinosDoAtleta,
} from '../../lib/desempenho';
import { NotaChip } from './NotaChip';
import {
  calcularNotaFinal, calcularTendencia, cargaDoTreino, cargaNoPeriodo, classificarBemEstar, classificarRazao,
  CRITERIOS, indiceBemEstar, ordenarAvaliacoes, razaoDeCarga, ROTULO_TENDENCIA,
} from '../../lib/regras';
import { formatarNumero } from '../../lib/texto';
import { useEstado } from '../../estado/EstadoApp';
import { GraficoLinha } from '../graficos/GraficoLinha';
import { GraficoBarras } from '../graficos/GraficoBarras';
import { Secao } from '../ui/Cartao';
import { EtiquetaBemEstar, EtiquetaTendencia } from './Status';

export function PainelEvolucao({ atleta }: { atleta: Atleta }) {
  const avaliacoes = ordenarAvaliacoes(atleta.avaliacoes);
  const tendencia = calcularTendencia(avaliacoes);
  const pontos = avaliacoes.map((a) => ({ rotulo: dataCurta(a.data), valor: calcularNotaFinal(a.notas) }));
  const ultima = avaliacoes.at(-1);
  const anterior = avaliacoes.at(-2);
  const sinal = tendencia.variacao > 0 ? '+' : '';

  const explicacao =
    tendencia.tipo === 'sem-dados'
      ? 'Com duas avaliações ou mais, mostramos a sua tendência.'
      : `A nota média variou ${sinal}${formatarNumero(tendencia.variacao, 2)} ponto por avaliação nas últimas ${Math.min(avaliacoes.length, 3)} avaliações.`;

  return (
    <>
      <Secao titulo="Nota média por avaliação" acao={<EtiquetaTendencia tipo={tendencia.tipo} />}>
        <p className="mb-4 text-tinta-suave">{explicacao}</p>
        <GraficoLinha
          pontos={pontos}
          descricao={`Nota média por avaliação: ${pontos.map((p) => `${p.rotulo}, ${formatarNumero(p.valor)}`).join('; ')}. Tendência: ${ROTULO_TENDENCIA[tendencia.tipo]}.`}
        />
      </Secao>

      {ultima && (
        <Secao titulo="Critérios na última avaliação">
          <ul className="grid gap-4 sm:grid-cols-2">
            {CRITERIOS.map((c) => {
              const valor = ultima.notas[c.id];
              const diferenca = anterior ? valor - anterior.notas[c.id] : null;
              return (
                <li key={c.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-tinta">{c.nome}</span>
                    <span className="flex items-baseline gap-2">
                      {diferenca !== null && diferenca !== 0 && (
                        <span className={`text-sm font-semibold ${diferenca > 0 ? 'text-sucesso' : 'text-atencao'}`}>
                          {diferenca > 0 ? '+' : ''}{formatarNumero(diferenca)}
                          <span className="sr-only"> em relação à avaliação anterior</span>
                        </span>
                      )}
                      <span className="font-display text-2xl font-bold text-tinta">{formatarNumero(valor)}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 rounded-full bg-superficie-2" aria-hidden="true">
                    <div className="h-2.5 rounded-full bg-realce" style={{ width: `${valor * 10}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          {ultima.observacao && (
            <blockquote className="mt-6 border-l-4 border-acento-forte pl-4">
              <p className="text-tinta">{ultima.observacao}</p>
              <footer className="mt-1 text-sm text-tinta-suave">{ultima.avaliador}, {dataCurta(ultima.data)}</footer>
            </blockquote>
          )}
        </Secao>
      )}
    </>
  );
}

export function PainelCarga({ atleta }: { atleta: Atleta }) {
  const { hoje } = useEstado();
  const dias = Array.from({ length: 14 }, (_, i) => somarDias(hoje, i - 13));
  const mediaDiaria = cargaNoPeriodo(atleta.checkins, hoje, 28) / 28;
  const barras = dias.map((d) => {
    const c = atleta.checkins.find((x) => x.data === d);
    const valor = c ? cargaDoTreino(c) : 0;
    return { rotulo: dataCurta(d).split(' ')[0], valor, destaque: mediaDiaria > 0 && valor > mediaDiaria * 1.5 };
  });
  const razao = razaoDeCarga(atleta.checkins, hoje);
  const faixa = classificarRazao(razao);
  const recentes = [...atleta.checkins].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);

  const leitura =
    faixa === 'alta' ? 'A carga desta semana está bem acima da média das últimas 4 semanas. Risco maior de lesão: vale reduzir a intensidade.'
      : faixa === 'baixa' ? 'A carga desta semana está abaixo da média das últimas 4 semanas.'
      : faixa === 'ideal' ? 'A carga desta semana está dentro da média das últimas 4 semanas.'
      : 'Ainda não há check-ins suficientes para comparar.';

  return (
    <Secao titulo="Carga de treino nos últimos 14 dias">
      <div className="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        <div className="lg:col-span-2">
          <GraficoBarras
            barras={barras}
            referencia={mediaDiaria || undefined}
            descricao={`Carga diária dos últimos 14 dias. Maior carga: ${formatarNumero(Math.max(...barras.map((b) => b.valor)), 0)} UA. ${leitura}`}
          />
          <p className="mt-2 text-sm text-tinta-suave">A linha tracejada é a sua média diária das últimas 4 semanas. Barras em destaque ficaram 50% acima dela.</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-tinta-suave">Semana atual comparada à média</p>
          <p className="font-display text-5xl font-bold text-tinta">{razao !== null ? `${formatarNumero(razao, 2)}×` : '–'}</p>
          <p className="mt-1 text-tinta">{leitura}</p>
          <h3 className="mt-6 text-xl text-tinta">Bem-estar recente</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {recentes.map((c) => (
              <li key={c.data} className="flex items-center justify-between gap-2">
                <span className="text-tinta">{dataCurta(c.data)}</span>
                <EtiquetaBemEstar nivel={classificarBemEstar(indiceBemEstar(c))} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Secao>
  );
}

/* ---------- Treinos avaliados pelo olheiro ---------- */

export function PainelTreinos({ atleta, treinos }: { atleta: Atleta; treinos: Treino[] }) {
  const historico = treinosDoAtleta(atleta.id, treinos);
  if (historico.length === 0) {
    return (
      <Secao titulo="Notas de treino">
        <p className="text-tinta-suave">Nenhum treino avaliado ainda. As notas aparecem aqui depois de cada avaliação do olheiro.</p>
      </Secao>
    );
  }
  const recentes = historico.slice(-10);
  const media = recentes.reduce((s, t) => s + t.nota, 0) / recentes.length;
  const falhas = falhasFrequentes(historico);
  const totais = new Map<StatTreino, number>();
  for (const { registro } of recentes) {
    for (const [stat, qtd] of Object.entries(registro.stats) as [StatTreino, number][]) totais.set(stat, (totais.get(stat) ?? 0) + qtd);
  }

  return (
    <>
      <Secao
        titulo="Notas de treino"
        descricao={`Média dos últimos ${recentes.length} treinos: ${formatarNumero(media)}. Toda nota começa em 6,5 e sobe ou desce com as estatísticas e os pontos a melhorar.`}
      >
        <GraficoLinha
          pontos={recentes.map((t) => ({ rotulo: dataCurta(t.treino.data), valor: t.nota }))}
          min={3}
          max={10}
          descricao={`Notas dos últimos treinos: ${recentes.map((t) => `${dataCurta(t.treino.data)}, ${formatarNumero(t.nota)}`).join('; ')}.`}
        />
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Notas por treino">
          {[...recentes].reverse().map((t) => (
            <li key={t.treino.id} className="flex flex-col items-center gap-1">
              <NotaChip nota={t.nota} tamanho="sm" rotulo={`${diaDaSemana(t.treino.data)}, ${dataCurta(t.treino.data)}`} />
              <span aria-hidden="true" className="text-xs text-tinta-suave">{dataCurta(t.treino.data).split(' ')[0]}</span>
            </li>
          ))}
        </ul>
      </Secao>

      <div className="grid gap-5 md:grid-cols-2 md:gap-6 [&>*]:min-w-0">
        <Secao titulo="Números nos treinos" descricao={`Soma dos últimos ${recentes.length} treinos.`}>
          {totais.size === 0 ? (
            <p className="text-tinta-suave">Nenhuma estatística marcada.</p>
          ) : (
            <dl className="divide-y divide-linha">
              {[...totais.entries()].map(([stat, qtd]) => (
                <div key={stat} className="flex items-center justify-between py-2">
                  <dt className="text-tinta">{STATS[stat].nome}</dt>
                  <dd className="num font-display text-2xl font-bold text-tinta">{qtd}</dd>
                </div>
              ))}
            </dl>
          )}
        </Secao>
        <Secao titulo="Onde está pecando" descricao="Pontos que o treinador mais marcou nos últimos treinos.">
          {falhas.length === 0 ? (
            <p className="text-tinta-suave">Nenhum ponto marcado. Mantenha o ritmo.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {falhas.map(({ falha, vezes }) => (
                <li key={falha}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold text-tinta">{FALHAS[falha].nome}</span>
                    <span className="text-sm text-tinta-suave">{vezes} {vezes === 1 ? 'treino' : 'treinos'}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-superficie-2" aria-hidden="true">
                    <div className="h-2 rounded-full bg-nota-regular" style={{ width: `${Math.min(100, (vezes / Math.min(historico.length, 10)) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Secao>
      </div>
    </>
  );
}

export function PainelOverall({ atleta, treinos }: { atleta: Atleta; treinos: Treino[] }) {
  const historico = historicoAtributos(atleta, treinos);
  const atual = historico.at(-1)?.atributos ?? ATRIBUTOS_INICIAIS;
  // Um ponto por data (o último evento de cada dia), limitado aos 8 mais recentes
  const porDia = new Map<string, number>();
  for (const p of historico) porDia.set(p.data, p.overall);
  const pontos = [...porDia.entries()].slice(-8).map(([data, overall]) => ({ rotulo: dataCurta(data), valor: overall }));
  const inicial = calcularOverall(ATRIBUTOS_INICIAIS, atleta.posicao);

  return (
    <Secao titulo="Overall" descricao={`Começou em ${inicial}. Cada avaliação e cada treino avaliado ajustam os atributos.`}>
      <div className="grid gap-6 lg:grid-cols-5 [&>*]:min-w-0">
        <div className="lg:col-span-3">
          {pontos.length >= 2 ? (
            <GraficoLinha pontos={pontos} min={40} max={99} descricao={`Overall ao longo do tempo: ${pontos.map((p) => `${p.rotulo}, ${p.valor}`).join('; ')}.`} />
          ) : (
            <p className="text-tinta-suave">O gráfico aparece depois da segunda avaliação.</p>
          )}
        </div>
        <ul className="flex flex-col gap-3 lg:col-span-2">
          {atributosDaPosicao(atleta.posicao).map((a) => (
            <li key={a.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-tinta">{a.nome}</span>
                <span className="num font-display text-2xl font-bold text-tinta">{Math.round(atual[a.id])}</span>
              </div>
              <div className="mt-1 h-2.5 rounded-full bg-superficie-2" aria-hidden="true">
                <div className="h-2.5 rounded-full bg-realce" style={{ width: `${atual[a.id]}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Secao>
  );
}
