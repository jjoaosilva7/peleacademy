import { CalendarClock } from 'lucide-react';
import type { Atleta } from '../../tipos';
import { useEstado } from '../../estado/EstadoApp';
import { NOME_PROFISSIONAL } from '../../lib/cuidado';
import { dataCurta, diaDaSemana } from '../../lib/datas';
import { Secao } from '../ui/Cartao';

/** Consultas futuras do atleta (marcadas por ele ou encaminhadas pela comissão). */
export function ConsultasAtleta({ atleta }: { atleta: Atleta }) {
  const { db, hoje } = useEstado();
  const consultas = db.consultas.filter((c) => c.atletaId === atleta.id && c.data >= hoje).sort((a, b) => a.data.localeCompare(b.data));
  if (consultas.length === 0) return null;
  return (
    <Secao titulo="Suas consultas">
      <ul className="flex flex-col gap-3">
        {consultas.map((c) => (
          <li key={c.id} className="flex items-start gap-3">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-sucesso-suave text-sucesso">
              <CalendarClock aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-tinta">{NOME_PROFISSIONAL[c.profissional]}: {diaDaSemana(c.data)}, {dataCurta(c.data)}, às {c.horario}</p>
              <p className="text-sm text-tinta-suave">
                {c.origem === 'equipe' ? 'Encaminhamento da comissão técnica' : 'Marcada por você'}{c.motivo ? `. ${c.motivo}` : ''}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Secao>
  );
}
