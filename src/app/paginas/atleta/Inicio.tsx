import { CalendarDays, ClipboardCheck, Dumbbell, PartyPopper, Search, TrendingUp } from 'lucide-react';
import { useEstado } from '../../estado/EstadoApp';
import { useDesempenho } from '../../estado/useDesempenho';
import type { Atleta } from '../../tipos';
import { dataCurta, dataLonga, diaDaSemana, diasEntre, textoPrazo } from '../../lib/datas';
import {
  categoriaDoAtleta, checkinDoDia, indiceBemEstar, verificarInscricao,
} from '../../lib/regras';
import { calcularOverall, FALHAS, STATS, treinosDoAtleta } from '../../lib/desempenho';
import { verificarCuidado } from '../../lib/cuidado';
import { formatarNumero, primeiroNome } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { LinkBotao } from '../../componentes/ui/Botao';
import { AcaoRapida, NumeroGrande, Pagina, Secao } from '../../componentes/ui/Cartao';
import { Vazio } from '../../componentes/ui/Vazio';
import { CartaoJogador } from '../../componentes/dominio/CartaoJogador';
import { ComoChegar } from '../../componentes/dominio/ComoChegar';
import { CuidadoCard } from '../../componentes/dominio/CuidadoCard';
import { ConsultasAtleta } from '../../componentes/dominio/ConsultasAtleta';
import { BotaoFoto } from '../../componentes/dominio/FotoPendente';
import { NotaChip } from '../../componentes/dominio/NotaChip';
import { EtiquetaInscricao } from '../../componentes/dominio/Status';
import { Temporada } from '../../componentes/dominio/Temporada';

export function Inicio() {
  useTitulo('Início');
  const { atletaLogado } = useEstado();
  if (!atletaLogado) return null;
  return atletaLogado.status === 'academia' ? <InicioAcademia atleta={atletaLogado} /> : <InicioCandidato atleta={atletaLogado} />;
}

function InicioCandidato({ atleta }: { atleta: Atleta }) {
  const { db, hoje } = useEstado();
  const { atributos } = useDesempenho();
  const categoria = categoriaDoAtleta(atleta, hoje);
  const minhas = db.inscricoes
    .filter((i) => i.atletaId === atleta.id)
    .map((i) => ({ inscricao: i, peneira: db.peneiras.find((p) => p.id === i.peneiraId)! }))
    .sort((a, b) => b.peneira.data.localeCompare(a.peneira.data));
  const proxima = minhas
    .filter(({ inscricao, peneira }) => inscricao.status === 'inscrito' && peneira.data >= hoje)
    .sort((a, b) => a.peneira.data.localeCompare(b.peneira.data))[0];
  const emAvaliacao = minhas.find(({ inscricao, peneira }) => inscricao.status === 'inscrito' && peneira.data < hoje);
  const abertas = db.peneiras.filter((p) => verificarInscricao(atleta, p, db.inscricoes, hoje).permitido).length;

  return (
    <Pagina
      titulo="Rumo à peneira"
      descricao={`${atleta.apelido || primeiroNome(atleta.nome)}, candidato, categoria ${categoria}.`}
      capa={
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {proxima ? (
              <>
                <p className="text-sm font-medium">Sua próxima peneira</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{textoPrazo(diasEntre(hoje, proxima.peneira.data))}</p>
                <p className="mt-2 max-w-sm">
                  {diaDaSemana(proxima.peneira.data)}, {dataLonga(proxima.peneira.data)}, às {proxima.peneira.horario}. {proxima.peneira.local}, {proxima.peneira.cidade} ({proxima.peneira.uf}).
                </p>
                <div className="mt-4"><ComoChegar peneira={proxima.peneira} variante="claro" compacto /></div>
              </>
            ) : emAvaliacao ? (
              <>
                <p className="text-sm font-medium">Peneira em avaliação</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">Aguarde o resultado</p>
                <p className="mt-2 max-w-sm">A equipe técnica está avaliando sua peneira de {dataCurta(emAvaliacao.peneira.data)}. Você recebe o parecer aqui.</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">Nenhuma inscrição ativa</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{abertas > 0 ? `${abertas} ${abertas === 1 ? 'peneira aberta' : 'peneiras abertas'}` : 'Fique de olho'}</p>
                <p className="mt-2 max-w-sm">{abertas > 0 ? 'Há peneira da sua categoria com vagas. Inscreva-se.' : 'Novas datas são publicadas toda semana.'}</p>
              </>
            )}
          </div>
          <div className="self-center sm:self-auto">
            <CartaoJogador atleta={atleta} atributos={atributos(atleta)} />
          </div>
        </div>
      }
    >
      <div className="-mt-1 flex flex-wrap gap-2">
        <LinkBotao to="/atleta/peneiras" variante="primario">
          <AcaoRapida icone={Search}>Procurar peneiras</AcaoRapida>
        </LinkBotao>
        {!atleta.foto && <BotaoFoto atleta={atleta} variante="contorno" />}
      </div>

      <Secao titulo="Suas inscrições" acao={minhas.length > 2 && <LinkBotao to="/atleta/peneiras?aba=inscricoes" variante="fantasma" tamanho="sm">Ver todas</LinkBotao>}>
        {minhas.length === 0 ? (
          <Vazio icone={CalendarDays} titulo="Nenhuma inscrição ainda" texto="Quando você se inscrever em uma peneira, o andamento aparece aqui." />
        ) : (
          <ul className="divide-y divide-linha">
            {minhas.slice(0, 2).map(({ inscricao, peneira }) => (
              <li key={inscricao.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-tinta">Peneira {peneira.categoria}, {peneira.cidade}</p>
                  <p className="text-sm text-tinta-suave">{dataLonga(peneira.data)}</p>
                </div>
                <EtiquetaInscricao inscricao={inscricao} peneira={peneira} hoje={hoje} />
              </li>
            ))}
          </ul>
        )}
      </Secao>
      <p className="text-sm text-tinta-suave">Seu cartão começa em {calcularOverall(atributos(atleta), atleta.posicao)} de overall. As notas do treinador na peneira e nos treinos mudam seus números.</p>
    </Pagina>
  );
}

function InicioAcademia({ atleta }: { atleta: Atleta }) {
  const { db, hoje } = useEstado();
  const { atributos } = useDesempenho();
  const checkin = checkinDoDia(atleta, hoje);
  const historico = treinosDoAtleta(atleta.id, db.treinos);
  const ultimo = historico.at(-1);
  const recentes = historico.slice(-3).reverse();
  const media = historico.length ? historico.slice(-5).reduce((s, t) => s + t.nota, 0) / Math.min(5, historico.length) : null;
  const cuidado = verificarCuidado(atleta, db.treinos);
  const recemAprovado = atleta.desde !== null && diasEntre(atleta.desde, hoje) <= 7;
  const diferenca = ultimo && media !== null ? ultimo.nota - media : null;

  return (
    <Pagina
      titulo="Bom treino"
      descricao={`${atleta.apelido || primeiroNome(atleta.nome)}, ${atleta.posicao.toLowerCase()}, ${categoriaDoAtleta(atleta, hoje)}${atleta.numero !== null ? `, camisa ${atleta.numero}` : ''}.`}
      capa={
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Nota do último treino</p>
            {ultimo ? (
              <>
                <p className="num mt-1 text-6xl font-semibold tracking-tight md:text-7xl">
                  <NumeroGrande valor={formatarNumero(ultimo.nota)} />
                </p>
                <p className="mt-2 text-sm">
                  {diaDaSemana(ultimo.treino.data)}, {dataCurta(ultimo.treino.data)}
                  {diferenca !== null && Math.abs(diferenca) >= 0.05 && (
                    <>. {diferenca > 0 ? '+' : '−'}{formatarNumero(Math.abs(diferenca))} em relação à sua média</>
                  )}
                </p>
              </>
            ) : (
              <p className="mt-2 text-lg">Ainda sem treino avaliado.</p>
            )}
          </div>
          <div className="self-center sm:self-auto">
            <CartaoJogador atleta={atleta} atributos={atributos(atleta)} />
          </div>
        </div>
      }
    >
      <div className="-mt-1 flex flex-wrap gap-2">
        {checkin ? (
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sucesso-suave px-4 font-medium text-sucesso">
            <ClipboardCheck aria-hidden="true" className="size-5" />
            Check-in feito: {indiceBemEstar(checkin)} de 20
          </span>
        ) : (
          <LinkBotao to="/atleta/check-in" variante="primario">
            <AcaoRapida icone={ClipboardCheck}>Fazer check-in</AcaoRapida>
          </LinkBotao>
        )}
        <LinkBotao to="/atleta/evolucao" variante="contorno">
          <AcaoRapida icone={TrendingUp}>Minha evolução</AcaoRapida>
        </LinkBotao>
        {!atleta.foto && <BotaoFoto atleta={atleta} variante="contorno" />}
      </div>

      {recemAprovado && (
        <div role="status" className="flex items-start gap-3 rounded-xl bg-sucesso-suave p-4 text-sucesso md:p-5">
          <PartyPopper aria-hidden="true" className="mt-0.5 size-6 shrink-0" />
          <p className="font-medium text-tinta">
            Você foi aprovado na peneira e agora é atleta da Pelé Academia. Seu check-in, seus treinos e seu cartão ficam aqui.
          </p>
        </div>
      )}

      {cuidado ? <CuidadoCard recomendacao={cuidado} /> : <ConsultasAtleta atleta={atleta} />}

      <div className="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
        <Secao titulo="Últimos treinos" acao={historico.length > 3 && <LinkBotao to="/atleta/evolucao" variante="fantasma" tamanho="sm">Ver todos</LinkBotao>}>
          {recentes.length === 0 ? (
            <p className="text-tinta-suave">As notas aparecem aqui depois que o treinador avaliar seu treino.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {recentes.map((t) => {
                const numeros = (Object.entries(t.registro.stats) as [keyof typeof STATS, number][])
                  .filter(([, v]) => v > 0)
                  .slice(0, 2)
                  .map(([k, v]) => `${v} ${(v === 1 ? STATS[k].singular : STATS[k].nome).toLowerCase()}`)
                  .join(', ');
                const falhas = t.registro.falhas.map((f) => FALHAS[f].nome.toLowerCase()).join(', ');
                return (
                  <li key={t.treino.id} className="flex items-center gap-3 py-2">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-superficie-2 text-tinta">
                      <Dumbbell aria-hidden="true" className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-tinta">{numeros || 'Sem números marcados'}</span>
                      <span className="block truncate text-sm text-tinta-suave">
                        {diaDaSemana(t.treino.data)}, {dataCurta(t.treino.data)}{falhas ? `. Melhorar: ${falhas}` : ''}
                      </span>
                    </span>
                    <NotaChip nota={t.nota} rotulo={`Nota de ${dataCurta(t.treino.data)}`} />
                  </li>
                );
              })}
            </ul>
          )}
        </Secao>
        <Temporada atleta={atleta} jogos={db.jogos} liberado resumo />
      </div>
    </Pagina>
  );
}
