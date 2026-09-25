import { useState, type ReactNode } from 'react';
import { useParams } from 'react-router';
import { ClipboardPlus, Star, UserX } from 'lucide-react';
import { useEstado } from '../../estado/EstadoApp';
import { useDesempenho } from '../../estado/useDesempenho';
import type { Atleta } from '../../tipos';
import { dataCurta, dataLonga } from '../../lib/datas';
import {
  calcularIdade, calcularNotaFinal, categoriaDoAtleta, checkinDoDia, classificarBemEstar, indiceBemEstar,
  listarAlertas, ordenarAvaliacoes, ultimosCheckins,
} from '../../lib/regras';
import { NOME_PROFISSIONAL, verificarCuidado } from '../../lib/cuidado';
import { formatarNumero, formatarTelefone, primeiroNome } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { Botao, LinkBotao } from '../../componentes/ui/Botao';
import { Pagina, Secao } from '../../componentes/ui/Cartao';
import { Abas, PainelAba } from '../../componentes/ui/Abas';
import { Etiqueta } from '../../componentes/ui/Etiqueta';
import { Vazio } from '../../componentes/ui/Vazio';
import { useAviso } from '../../componentes/ui/Aviso';
import { CartaoJogador } from '../../componentes/dominio/CartaoJogador';
import { BotaoFoto } from '../../componentes/dominio/FotoPendente';
import { PainelCarga, PainelEvolucao, PainelOverall, PainelTreinos } from '../../componentes/dominio/Paineis';
import { EtiquetaBemEstar, EtiquetaInscricao } from '../../componentes/dominio/Status';
import { TagsVotaveis } from '../../componentes/dominio/TagsVotaveis';
import { Temporada } from '../../componentes/dominio/Temporada';
import { Encaminhar } from '../../componentes/dominio/Encaminhar';
import { Voltar } from './PeneiraDetalhe';

function Item({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold">{rotulo}</dt>
      <dd className="text-sobre-marca">{children}</dd>
    </div>
  );
}

export function FichaAtleta() {
  const { id } = useParams();
  const { db } = useEstado();
  const atleta = db.atletas.find((a) => a.id === id);
  useTitulo(atleta ? `Ficha de ${atleta.nome}` : 'Atleta não encontrado');
  if (!atleta) {
    return (
      <Pagina titulo="Atleta não encontrado" voltar={<Voltar para="/equipe/atletas" texto="Atletas" />}>
        <Vazio icone={UserX} titulo="Atleta não encontrado" />
      </Pagina>
    );
  }
  return <Ficha key={atleta.id} atleta={atleta} />;
}

function Ficha({ atleta }: { atleta: Atleta }) {
  const { db, hoje, usuario, alternarSeguir } = useEstado();
  const { atributos } = useDesempenho();
  const avisar = useAviso();
  const academia = atleta.status === 'academia';
  const [aba, setAba] = useState(academia ? 'resumo' : 'peneiras');
  if (!usuario) return null;

  const favorito = usuario.seguindo.includes(atleta.id);
  const alertas = listarAlertas(atleta, hoje);
  const cuidado = verificarCuidado(atleta, db.treinos);
  const consultas = db.consultas.filter((c) => c.atletaId === atleta.id && c.data >= hoje);
  const checkin = checkinDoDia(atleta, hoje) ?? ultimosCheckins(atleta, 1)[0];
  const checkinEhDeHoje = checkin?.data === hoje;
  const avaliacoes = ordenarAvaliacoes(atleta.avaliacoes).reverse();
  const inscricoes = db.inscricoes
    .filter((i) => i.atletaId === atleta.id)
    .map((i) => ({ inscricao: i, peneira: db.peneiras.find((p) => p.id === i.peneiraId)! }));

  const abas = academia
    ? [
        { id: 'resumo', rotulo: 'Resumo' },
        { id: 'treinos', rotulo: 'Treinos' },
        { id: 'jogos', rotulo: 'Jogos' },
        { id: 'avaliacoes', rotulo: 'Avaliações' },
        { id: 'carga', rotulo: 'Bem-estar e carga' },
      ]
    : [
        { id: 'peneiras', rotulo: 'Peneiras' },
        { id: 'avaliacoes', rotulo: 'Avaliações' },
      ];

  function favoritar() {
    const agora = alternarSeguir(atleta.id);
    avisar(agora ? `${primeiroNome(atleta.nome)} adicionado aos favoritos.` : `${primeiroNome(atleta.nome)} removido dos favoritos.`, agora ? 'sucesso' : 'info');
  }

  return (
    <Pagina
      voltar={<Voltar para="/equipe/atletas" texto="Atletas" />}
      titulo={atleta.apelido || atleta.nome}
      descricao={
        <>
          {atleta.apelido && <>{atleta.nome}. </>}
          {atleta.posicao}, {calcularIdade(atleta.nascimento, hoje)} anos, {categoriaDoAtleta(atleta, hoje)}. {atleta.cidade} ({atleta.uf}).
        </>
      }
      acao={
        <div className="flex flex-wrap gap-2">
          <Botao variante="claro" aria-pressed={favorito} onClick={favoritar}>
            <Star aria-hidden="true" className={`size-5 ${favorito ? 'fill-acento text-acento' : ''}`} />
            {favorito ? 'Favorito' : 'Favoritar'}
          </Botao>
          <BotaoFoto atleta={atleta} variante="claro" />
          {academia && (
            <LinkBotao to={`/equipe/atletas/${atleta.id}/avaliar`} variante="primario">
              <ClipboardPlus aria-hidden="true" className="size-5" />
              Avaliação técnica
            </LinkBotao>
          )}
        </div>
      }
      capa={
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
          <CartaoJogador atleta={atleta} atributos={atributos(atleta)} />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 pb-2">
            <Item rotulo="Situação">{academia ? `Na academia desde ${atleta.desde ? dataCurta(atleta.desde) : '–'}` : 'Candidato'}</Item>
            <Item rotulo="Pé dominante">{atleta.pe}</Item>
            <Item rotulo="Altura e peso">{atleta.alturaCm ?? '–'} cm, {atleta.pesoKg ?? '–'} kg</Item>
            <Item rotulo="Responsável">
              {atleta.responsavel ? (
                <>{atleta.responsavel.nome}, <span className="whitespace-nowrap">{formatarTelefone(atleta.responsavel.telefone)}</span></>
              ) : 'Maior de idade'}
            </Item>
          </dl>
        </div>
      }
    >
      <div>
        <Abas rotulo={`Ficha de ${atleta.nome}`} ativa={aba} aoMudar={setAba} abas={abas} />
      </div>

        {aba === 'resumo' && (
          <PainelAba id="resumo" className="flex flex-col gap-5 md:gap-6">
            <Secao>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-2xl text-tinta">Alertas e cuidado</h2>
                {alertas.length === 0 && !cuidado ? (
                  <p className="mt-2 text-tinta-suave">Nenhum alerta no momento.</p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {cuidado?.profissionais.map((p) => <li key={p}><Etiqueta tom="erro">Encaminhar: {NOME_PROFISSIONAL[p].toLowerCase()}</Etiqueta></li>)}
                    {alertas.map((a) => <li key={a}><Etiqueta tom="atencao">{a}</Etiqueta></li>)}
                  </ul>
                )}
                {cuidado && <p className="mt-2 text-sm text-tinta-suave">{cuidado.detalhes.join('. ')}.</p>}
                {consultas.map((c) => (
                  <p key={c.id} className="mt-2 font-semibold text-sucesso">
                    {NOME_PROFISSIONAL[c.profissional]} marcado para {dataLonga(c.data)}, às {c.horario}
                    {c.origem === 'equipe' ? ', pela comissão.' : ', pelo atleta.'}
                  </p>
                ))}
                {academia && <div className="mt-3"><Encaminhar atleta={atleta} recomendacao={cuidado} variante="marca" tamanho="md" /></div>}
              </div>
              <div>
                <h2 className="text-2xl text-tinta">{checkin && !checkinEhDeHoje ? `Último check-in, ${dataCurta(checkin.data)}` : 'Check-in de hoje'}</h2>
                {checkin ? (
                  <>
                    <p className="mt-2 flex items-center gap-3">
                      <span className="num font-display text-4xl font-bold text-tinta">{indiceBemEstar(checkin)}<span className="ml-1 font-sans text-base font-semibold text-tinta-suave">de 20</span></span>
                      <EtiquetaBemEstar nivel={classificarBemEstar(indiceBemEstar(checkin))} />
                    </p>
                    <p className="mt-1 text-tinta">Sono {checkin.sono}, dor {checkin.dor}, cansaço {checkin.cansaco}, estresse {checkin.estresse} (1 a 5).</p>
                  </>
                ) : (
                  <p className="mt-2 text-tinta-suave">{primeiroNome(atleta.nome)} ainda não fez nenhum check-in.</p>
                )}
              </div>
              <div className="md:col-span-2">
                <h2 className="text-2xl text-tinta">Pontos fortes na rede</h2>
                <div className="mt-2"><TagsVotaveis tags={atleta.tags} usuarioId={usuario.id} /></div>
              </div>
            </div>
            </Secao>
          </PainelAba>
        )}

        {aba === 'treinos' && (
          <PainelAba id="treinos" className="flex flex-col gap-5 md:gap-6">
            <div className="flex flex-col gap-5">
              <PainelOverall atleta={atleta} treinos={db.treinos} />
              <PainelTreinos atleta={atleta} treinos={db.treinos} />
            </div>
          </PainelAba>
        )}

        {aba === 'jogos' && (
          <PainelAba id="jogos" className="flex flex-col gap-5 md:gap-6">
            <div className="flex flex-col gap-5">
              <Temporada atleta={atleta} jogos={db.jogos} liberado />
            </div>
          </PainelAba>
        )}

        {aba === 'avaliacoes' && (
          <PainelAba id="avaliacoes" className="flex flex-col gap-5 md:gap-6">
            {avaliacoes.length === 0 ? (
              <Secao><Vazio icone={ClipboardPlus} titulo="Nenhuma avaliação técnica registrada" /></Secao>
            ) : (
              <div className="flex flex-col gap-5">
                {academia && <PainelEvolucao atleta={atleta} />}
                <Secao titulo="Histórico">
                  <ul className="divide-y divide-linha">
                    {avaliacoes.map((a) => (
                      <li key={a.id} className="flex flex-wrap items-start gap-4 py-4 first:pt-0 last:pb-0">
                        <p className="num w-16 font-display text-3xl font-bold text-tinta">{formatarNumero(calcularNotaFinal(a.notas))}</p>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-tinta">{dataLonga(a.data)}, {a.origem === 'peneira' ? 'peneira' : 'avaliação na academia'}</p>
                          <p className="text-sm text-tinta-suave">Por {a.avaliador}</p>
                          {a.observacao && <p className="mt-1 text-tinta">{a.observacao}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Secao>
              </div>
            )}
          </PainelAba>
        )}

        {aba === 'carga' && (
          <PainelAba id="carga" className="flex flex-col gap-5 md:gap-6">
            <PainelCarga atleta={atleta} />
          </PainelAba>
        )}

        {aba === 'peneiras' && (
          <PainelAba id="peneiras" className="flex flex-col gap-5 md:gap-6">
            <Secao>
            {inscricoes.length === 0 ? (
              <Vazio icone={ClipboardPlus} titulo="Sem inscrições em peneiras" />
            ) : (
              <ul className="divide-y divide-linha">
                {inscricoes.map(({ inscricao, peneira }) => (
                  <li key={inscricao.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-semibold text-tinta">Peneira {peneira.categoria}, {peneira.cidade} ({peneira.uf})</p>
                      <p className="text-sm text-tinta-suave">{dataLonga(peneira.data)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <EtiquetaInscricao inscricao={inscricao} peneira={peneira} hoje={hoje} />
                      {inscricao.status === 'inscrito' && peneira.data <= hoje && (
                        <LinkBotao to={`/equipe/avaliar/${inscricao.id}`} variante="marca" tamanho="sm">Avaliar</LinkBotao>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            </Secao>
          </PainelAba>
        )}
    </Pagina>
  );
}
