import { useEstado } from '../../estado/EstadoApp';
import type { Inscricao, Peneira } from '../../tipos';
import { dataLonga } from '../../lib/datas';
import { plural } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { LinkBotao } from '../../componentes/ui/Botao';
import { Pagina, Secao } from '../../componentes/ui/Cartao';
import { Etiqueta } from '../../componentes/ui/Etiqueta';

function LinhaPeneira({ peneira, inscricoes, hoje }: { peneira: Peneira; inscricoes: Inscricao[]; hoje: string }) {
  const daPeneira = inscricoes.filter((i) => i.peneiraId === peneira.id);
  const pendentes = daPeneira.filter((i) => i.status === 'inscrito').length;
  const realizada = peneira.data <= hoje;
  return (
    <li className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <h3 className="text-2xl text-tinta">{peneira.categoria}, {peneira.cidade} ({peneira.uf})</h3>
        <p className="text-tinta-suave">{dataLonga(peneira.data)}, às {peneira.horario}. {peneira.local}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Etiqueta>{plural(daPeneira.length, 'inscrito', 'inscritos')} de {peneira.vagas}</Etiqueta>
          {realizada && pendentes > 0 && <Etiqueta tom="atencao">{plural(pendentes, 'avaliação pendente', 'avaliações pendentes')}</Etiqueta>}
          {realizada && pendentes === 0 && daPeneira.length > 0 && <Etiqueta tom="sucesso">Avaliações concluídas</Etiqueta>}
        </div>
      </div>
      <LinkBotao
        to={`/equipe/peneiras/${peneira.id}`}
        variante={realizada && pendentes > 0 ? 'marca' : 'contorno'}
        tamanho="sm"
        className="w-full sm:w-auto"
        aria-label={`Ver inscritos da peneira ${peneira.categoria} em ${peneira.cidade}`}
      >
        Ver inscritos
      </LinkBotao>
    </li>
  );
}

export function PeneirasEquipe() {
  useTitulo('Peneiras');
  const { db, hoje } = useEstado();
  const realizadas = db.peneiras.filter((p) => p.data <= hoje).sort((a, b) => b.data.localeCompare(a.data));
  const proximas = db.peneiras.filter((p) => p.data > hoje).sort((a, b) => a.data.localeCompare(b.data));

  return (
    <Pagina titulo="Peneiras" descricao="Acompanhe os inscritos e avalie os candidatos depois de cada peneira.">
      <Secao titulo="Realizadas">
        <ul className="divide-y divide-linha">
          {realizadas.map((p) => <LinhaPeneira key={p.id} peneira={p} inscricoes={db.inscricoes} hoje={hoje} />)}
        </ul>
      </Secao>
      <Secao titulo="Próximas">
        <ul className="divide-y divide-linha">
          {proximas.map((p) => <LinhaPeneira key={p.id} peneira={p} inscricoes={db.inscricoes} hoje={hoje} />)}
        </ul>
      </Secao>
    </Pagina>
  );
}
