import { Link, useParams } from 'react-router';
import { ArrowLeft, Users } from 'lucide-react';
import { useEstado } from '../../estado/EstadoApp';
import { dataLonga } from '../../lib/datas';
import { calcularIdade, calcularNotaFinal } from '../../lib/regras';
import { formatarNumero } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { LinkBotao } from '../../componentes/ui/Botao';
import { Pagina, Secao } from '../../componentes/ui/Cartao';
import { FotoJogador } from '../../componentes/dominio/FotoJogador';
import { Vazio } from '../../componentes/ui/Vazio';
import { EtiquetaInscricao } from '../../componentes/dominio/Status';

export function Voltar({ para, texto }: { para: string; texto: string }) {
  return (
    <Link to={para} className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-superficie text-tinta shadow-folha hover:bg-superficie-2">
      <ArrowLeft aria-hidden="true" className="size-5" />
      <span className="sr-only">Voltar para {texto.toLowerCase()}</span>
    </Link>
  );
}

export function PeneiraDetalhe() {
  const { id } = useParams();
  const { db, hoje } = useEstado();
  const peneira = db.peneiras.find((p) => p.id === id);
  useTitulo(peneira ? `Peneira ${peneira.categoria}` : 'Peneira não encontrada');

  if (!peneira) {
    return (
      <Pagina titulo="Peneira não encontrada" voltar={<Voltar para="/equipe/peneiras" texto="Peneiras" />}>
        <Vazio icone={Users} titulo="Peneira não encontrada" />
      </Pagina>
    );
  }

  const realizada = peneira.data <= hoje;
  const inscritos = db.inscricoes
    .filter((i) => i.peneiraId === peneira.id)
    .map((i) => ({ inscricao: i, atleta: db.atletas.find((a) => a.id === i.atletaId)! }))
    .filter((x) => x.atleta);

  return (
    <Pagina
      voltar={<Voltar para="/equipe/peneiras" texto="Peneiras" />}
      titulo={`Peneira ${peneira.categoria}`}
      descricao={`${dataLonga(peneira.data)}, às ${peneira.horario}. ${peneira.local}, ${peneira.cidade} (${peneira.uf}).`}
    >
      <Secao titulo="Inscritos">
      {inscritos.length === 0 ? (
        <Vazio icone={Users} titulo="Nenhum inscrito ainda" texto="Os candidatos aparecem aqui conforme se inscrevem pelo app." />
      ) : (
        <ul className="divide-y divide-linha">
          {inscritos.map(({ inscricao, atleta }) => {
            const avaliacao = atleta.avaliacoes.find((a) => a.id === inscricao.avaliacaoId);
            return (
              <li key={inscricao.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                <FotoJogador atleta={atleta} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl">
                    <Link to={`/equipe/atletas/${atleta.id}`} className="text-tinta underline-offset-4 hover:text-realce hover:underline">{atleta.nome}</Link>
                  </h3>
                  <p className="text-tinta-suave">{atleta.posicao}, {calcularIdade(atleta.nascimento, hoje)} anos. {atleta.cidade} ({atleta.uf})</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {avaliacao && <span className="font-display text-3xl font-bold text-tinta">{formatarNumero(calcularNotaFinal(avaliacao.notas))}</span>}
                  <EtiquetaInscricao inscricao={inscricao} peneira={peneira} hoje={hoje} />
                  {inscricao.status === 'inscrito' &&
                    (realizada ? (
                      <LinkBotao to={`/equipe/avaliar/${inscricao.id}`} variante="marca" tamanho="sm" aria-label={`Avaliar ${atleta.nome}`}>Avaliar</LinkBotao>
                    ) : (
                      <span className="text-sm text-tinta-suave">Avaliação liberada no dia da peneira</span>
                    ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      </Secao>
    </Pagina>
  );
}
