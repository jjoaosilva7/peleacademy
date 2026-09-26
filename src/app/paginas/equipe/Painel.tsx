// Painel da equipe: alertas de cuidado, encaminhamentos e próximas peneiras. (Lucas Rodrigues de Carvalho · Grupo Zenyth)
import { ClipboardCheck, ClipboardList, HeartPulse, ShieldCheck, Timer, UsersRound } from 'lucide-react';
import { useEstado } from '../../estado/EstadoApp';
import { useDesempenho } from '../../estado/useDesempenho';
import { dataCurta, dataLonga } from '../../lib/datas';
import { checkinDoDia, listarAlertas } from '../../lib/regras';
import { verificarCuidado, NOME_PROFISSIONAL } from '../../lib/cuidado';
import { treinosDoAtleta } from '../../lib/desempenho';
import { primeiroNome } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { LinkBotao } from '../../componentes/ui/Botao';
import { FaixaIndicadores, Indicador, Pagina, Secao } from '../../componentes/ui/Cartao';
import { Etiqueta } from '../../componentes/ui/Etiqueta';
import { Vazio } from '../../componentes/ui/Vazio';
import { FotoJogador } from '../../componentes/dominio/FotoJogador';
import { NotaChip } from '../../componentes/dominio/NotaChip';
import { Encaminhar } from '../../componentes/dominio/Encaminhar';

export function Painel() {
  useTitulo('Painel da equipe');
  const { db, hoje, usuario } = useEstado();
  const { overall } = useDesempenho();
  if (!usuario) return null;

  const academia = db.atletas.filter((a) => a.status === 'academia');
  const comCheckin = academia.filter((a) => checkinDoDia(a, hoje)).length;
  const treinoHoje = db.treinos.some((t) => t.data === hoje);
  const emAtencao = academia
    .map((a) => ({ atleta: a, alertas: listarAlertas(a, hoje), cuidado: verificarCuidado(a, db.treinos) }))
    .filter((x) => x.alertas.length > 0 || x.cuidado)
    .sort((a, b) => Number(Boolean(b.cuidado)) - Number(Boolean(a.cuidado)) || b.alertas.length - a.alertas.length);
  const aguardando = db.inscricoes
    .filter((i) => i.status === 'inscrito')
    .map((i) => ({ inscricao: i, peneira: db.peneiras.find((p) => p.id === i.peneiraId)!, atleta: db.atletas.find((a) => a.id === i.atletaId)! }))
    .filter((x) => x.atleta && x.peneira.data <= hoje);
  const proximaConsulta = db.consultas.filter((c) => c.data >= hoje).sort((a, b) => a.data.localeCompare(b.data));

  return (
    <Pagina
      titulo="Hoje no CT"
      descricao={`${dataLonga(hoje)}. ${primeiroNome(usuario.nome)}, ${usuario.cargo?.toLowerCase()}.`}
      acao={
        <LinkBotao to="/equipe/treino" variante="primario" tamanho="lg">
          <Timer aria-hidden="true" className="size-5" />
          {treinoHoje ? 'Revisar treino de hoje' : 'Avaliar treino de hoje'}
        </LinkBotao>
      }
    >
      <FaixaIndicadores>
        <Indicador rotulo="Atletas na academia" valor={academia.length} icone={UsersRound} />
        <Indicador rotulo="Check-ins de hoje" valor={`${comCheckin}/${academia.length}`} icone={ClipboardCheck} progresso={academia.length ? comCheckin / academia.length : 0} cor="verde" />
        <Indicador rotulo="Precisam de atenção" valor={emAtencao.length} icone={HeartPulse} progresso={academia.length ? emAtencao.length / academia.length : 0} cor="coral" />
        <Indicador rotulo="Candidatos para avaliar" valor={aguardando.length} icone={ClipboardList} />
      </FaixaIndicadores>

      <Secao titulo="Precisam de atenção" descricao="Encaminhamentos da rede de cuidado aparecem primeiro." acao={emAtencao.length > 3 && <LinkBotao to="/equipe/atletas" variante="fantasma" tamanho="sm">Ver todos</LinkBotao>}>
        {emAtencao.length === 0 ? (
          <Vazio icone={ShieldCheck} titulo="Tudo em ordem" texto="Nenhum atleta com alerta de bem-estar, carga ou desempenho." />
        ) : (
          <ul className="divide-y divide-linha">
            {emAtencao.slice(0, 3).map(({ atleta, alertas, cuidado }) => {
              const ultimos = treinosDoAtleta(atleta.id, db.treinos).slice(-3);
              const consulta = db.consultas.find((c) => c.atletaId === atleta.id && c.data >= hoje);
              return (
                <li key={atleta.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <FotoJogador atleta={atleta} tamanho="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-tinta">{atleta.apelido || atleta.nome} <span className="font-sans text-base font-normal text-tinta-suave">OVR {overall(atleta)}</span></p>
                    {ultimos.length > 0 && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-tinta-suave">
                        Últimos treinos: {ultimos.map((t) => <NotaChip key={t.treino.id} nota={t.nota} tamanho="sm" />)}
                      </p>
                    )}
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                        {!consulta && cuidado?.profissionais.map((p) => <li key={p}><Etiqueta tom="erro">Sugestão: {NOME_PROFISSIONAL[p].toLowerCase()}</Etiqueta></li>)}
                      {alertas.map((a) => <li key={a}><Etiqueta tom="atencao">{a}</Etiqueta></li>)}
                      {consulta && <li><Etiqueta tom="sucesso">{NOME_PROFISSIONAL[consulta.profissional]} marcado, {dataCurta(consulta.data)}</Etiqueta></li>}
                    </ul>
                  </div>
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-col">
                    {!consulta && <Encaminhar atleta={atleta} recomendacao={cuidado} />}
                    <LinkBotao to={`/equipe/atletas/${atleta.id}`} variante="contorno" tamanho="sm" aria-label={`Abrir ficha de ${atleta.nome}`}>Abrir ficha</LinkBotao>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Secao>

      <div className="grid gap-5 md:grid-cols-2 md:gap-6 [&>*]:min-w-0">
        <Secao titulo="Aguardando avaliação" acao={<LinkBotao to="/equipe/peneiras" variante="fantasma" tamanho="sm">Peneiras</LinkBotao>}>
          {aguardando.length === 0 ? (
            <Vazio icone={ClipboardList} titulo="Nenhum candidato pendente" />
          ) : (
            <ul className="divide-y divide-linha">
              {aguardando.slice(0, 3).map(({ inscricao, peneira, atleta }) => (
                <li key={inscricao.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <FotoJogador atleta={atleta} tamanho="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-tinta">{atleta.nome}</p>
                    <p className="text-sm text-tinta-suave">{atleta.posicao}. Peneira {peneira.categoria}, {dataCurta(peneira.data)}</p>
                  </div>
                  <LinkBotao to={`/equipe/avaliar/${inscricao.id}`} variante="marca" tamanho="sm" aria-label={`Avaliar ${atleta.nome}`}>Avaliar</LinkBotao>
                </li>
              ))}
            </ul>
          )}
        </Secao>
        <Secao titulo="Consultas marcadas">
          {proximaConsulta.length === 0 ? (
            <p className="text-tinta-suave">Encaminhamentos da comissão e consultas marcadas pelos atletas aparecem aqui.</p>
          ) : (
            <ul className="divide-y divide-linha">
              {proximaConsulta.map((c) => {
                const atleta = db.atletas.find((a) => a.id === c.atletaId);
                return (
                  <li key={c.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="font-semibold text-tinta">{atleta?.apelido || atleta?.nome}, {NOME_PROFISSIONAL[c.profissional].toLowerCase()}</p>
                    <p className="text-sm text-tinta-suave">{dataLonga(c.data)}, às {c.horario}. {c.origem === 'equipe' ? 'Encaminhado pela comissão' : 'Marcado pelo atleta'}.</p>
                  </li>
                );
              })}
            </ul>
          )}
        </Secao>
      </div>
    </Pagina>
  );
}
