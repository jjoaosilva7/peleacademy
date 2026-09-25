import { useState } from 'react';
import { HeartPulse } from 'lucide-react';
import type { Profissional } from '../../tipos';
import { useEstado } from '../../estado/EstadoApp';
import { NOME_PROFISSIONAL, type Recomendacao } from '../../lib/cuidado';
import { dataCurta, diaDaSemana, somarDias } from '../../lib/datas';
import { Botao } from '../ui/Botao';
import { useAviso } from '../ui/Aviso';

const HORARIOS = ['08:00', '14:00', '17:30'];

/** Alerta da rede de cuidado com agendamento rápido em horários dos próximos dias. */
export function CuidadoCard({ recomendacao }: { recomendacao: Recomendacao }) {
  const { db, hoje, atletaLogado, agendarConsulta } = useEstado();
  const avisar = useAviso();
  const [escolhendo, setEscolhendo] = useState<Profissional | null>(null);
  if (!atletaLogado) return null;

  const agendadas = db.consultas.filter((c) => c.atletaId === atletaLogado.id && c.data >= hoje);
  const dias = [1, 2, 3].map((d) => somarDias(hoje, d));

  function agendar(profissional: Profissional, data: string, horario: string) {
    agendarConsulta(profissional, data, horario, recomendacao.motivo);
    setEscolhendo(null);
    avisar(`Consulta com ${NOME_PROFISSIONAL[profissional].toLowerCase()} marcada para ${diaDaSemana(data)}, ${dataCurta(data)}, às ${horario}.`, 'sucesso');
  }

  return (
    <section aria-labelledby="titulo-cuidado" className="rounded-md border border-linha border-l-4 border-l-acento bg-superficie p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-acento text-sobre-acento">
          <HeartPulse aria-hidden="true" className="size-6" />
        </span>
        <div className="min-w-0">
          <h2 id="titulo-cuidado" className="text-2xl text-tinta md:text-3xl">Vamos cuidar de você</h2>
          <p className="mt-1 text-tinta">{recomendacao.motivo} A comissão sugere conversar com {recomendacao.profissionais.map((p) => NOME_PROFISSIONAL[p].toLowerCase()).join(' e com ')}.</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-tinta-suave">
            {recomendacao.detalhes.map((d) => <li key={d}>{d}</li>)}
          </ul>
        </div>
      </div>

      {agendadas.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {agendadas.map((c) => (
            <li key={c.id} className="rounded-lg bg-sucesso-suave px-4 py-3 font-semibold text-sucesso">
              {NOME_PROFISSIONAL[c.profissional]} marcado: {diaDaSemana(c.data)}, {dataCurta(c.data)}, às {c.horario}
              {c.origem === 'equipe' && <span className="block text-sm font-normal">Encaminhamento da comissão técnica{c.motivo ? `: ${c.motivo}` : ''}</span>}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {recomendacao.profissionais
          .filter((p) => !agendadas.some((c) => c.profissional === p))
          .map((p) => (
            <Botao key={p} variante={escolhendo === p ? 'marca' : 'primario'} aria-expanded={escolhendo === p} onClick={() => setEscolhendo(escolhendo === p ? null : p)}>
              Agendar com {NOME_PROFISSIONAL[p].toLowerCase()}
            </Botao>
          ))}
      </div>

      {escolhendo && (
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-tinta">Escolha um horário no CT</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {dias.map((d) => (
              <div key={d}>
                <p className="text-sm font-semibold capitalize text-tinta-suave">{diaDaSemana(d)}, {dataCurta(d)}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {HORARIOS.map((h) => (
                    <Botao key={h} variante="contorno" tamanho="sm" onClick={() => agendar(escolhendo, d, h)} aria-label={`${diaDaSemana(d)}, ${dataCurta(d)}, às ${h}`}>
                      {h}
                    </Botao>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      )}
    </section>
  );
}
