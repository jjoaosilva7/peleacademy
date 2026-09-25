import { CalendarDays, MapPin, Users } from 'lucide-react';
import type { Peneira } from '../../tipos';
import { dataLonga, diaDaSemana } from '../../lib/datas';
import { Botao } from '../ui/Botao';
import { Etiqueta } from '../ui/Etiqueta';
import { ComoChegar } from './ComoChegar';

interface Props {
  peneira: Peneira;
  vagas: number;
  inscrito: boolean;
  motivoBloqueio?: string;
  aoInscrever: () => void;
}

export function CartaoPeneira({ peneira, vagas, inscrito, motivoBloqueio, aoInscrever }: Props) {
  const idMotivo = `motivo-${peneira.id}`;
  return (
    <article className="flex h-full flex-col rounded-xl border border-linha bg-superficie p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-3xl text-tinta">{peneira.categoria}</h3>
        {inscrito ? <Etiqueta tom="sucesso">Inscrito</Etiqueta> : vagas <= 3 && vagas > 0 ? <Etiqueta tom="atencao">Últimas vagas</Etiqueta> : null}
      </div>
      <dl className="mt-3 flex flex-col gap-2 text-tinta">
        <div className="flex items-start gap-2.5">
          <dt className="sr-only">Data</dt>
          <CalendarDays aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-tinta-suave" />
          <dd>{dataLonga(peneira.data)}, {diaDaSemana(peneira.data)}, às {peneira.horario}</dd>
        </div>
        <div className="flex items-start gap-2.5">
          <dt className="sr-only">Local</dt>
          <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-tinta-suave" />
          <dd>
            {peneira.local}, {peneira.cidade} ({peneira.uf})
            <span className="mt-1 block"><ComoChegar peneira={peneira} variante="fantasma" compacto /></span>
          </dd>
        </div>
        <div className="flex items-start gap-2.5">
          <dt className="sr-only">Vagas</dt>
          <Users aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-tinta-suave" />
          <dd>{vagas === 0 ? 'Vagas esgotadas' : `${vagas} de ${peneira.vagas} vagas disponíveis`}</dd>
        </div>
      </dl>
      <div className="mt-auto pt-4">
        {inscrito ? (
          <p className="text-sm font-medium text-sucesso">Você está inscrito. Leve documento com foto e chuteira.</p>
        ) : (
          <>
            {motivoBloqueio && <p id={idMotivo} className="mb-2 text-sm text-tinta-suave">{motivoBloqueio}</p>}
            <Botao
              variante="marca"
              className="w-full"
              onClick={aoInscrever}
              disabled={Boolean(motivoBloqueio)}
              aria-describedby={motivoBloqueio ? idMotivo : undefined}
            >
              Inscrever-me
            </Botao>
          </>
        )}
      </div>
    </article>
  );
}
