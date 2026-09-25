import { useState } from 'react';
import { HeartPulse } from 'lucide-react';
import type { Atleta, Profissional } from '../../tipos';
import { useEstado } from '../../estado/EstadoApp';
import { NOME_PROFISSIONAL, type Recomendacao } from '../../lib/cuidado';
import { dataCurta, diaDaSemana, somarDias } from '../../lib/datas';
import { primeiroNome } from '../../lib/texto';
import { Botao } from '../ui/Botao';
import { CampoAreaTexto } from '../ui/Campo';
import { Dialogo } from '../ui/Dialogo';
import { Escolha } from '../ui/Escolha';
import { useAviso } from '../ui/Aviso';

const HORARIOS = ['08:00', '14:00', '17:30'];

/**
 * A equipe técnica encaminha o atleta ao fisioterapeuta ou ao psicólogo do esporte,
 * escolhendo o profissional, o horário no CT e o motivo. O atleta vê a consulta no início do app.
 */
export function Encaminhar({ atleta, recomendacao, variante = 'marca', tamanho = 'sm' }: { atleta: Atleta; recomendacao: Recomendacao | null; variante?: 'marca' | 'contorno' | 'primario'; tamanho?: 'sm' | 'md' }) {
  const { hoje, encaminhar } = useEstado();
  const avisar = useAviso();
  const [aberto, setAberto] = useState(false);
  const [profissional, setProfissional] = useState<Profissional>(recomendacao?.profissionais[0] ?? 'fisio');
  const [horario, setHorario] = useState<string | null>(null);
  const [motivo, setMotivo] = useState(recomendacao ? recomendacao.detalhes.join('. ') : '');
  const [erro, setErro] = useState<string | null>(null);
  const dias = [1, 2, 3].map((d) => somarDias(hoje, d));
  const nome = atleta.apelido || primeiroNome(atleta.nome);

  function confirmar() {
    if (!horario) {
      setErro('Escolha um horário.');
      return;
    }
    const [data, hora] = horario.split(' ');
    encaminhar(atleta.id, profissional, data, hora, motivo.trim());
    setAberto(false);
    setHorario(null);
    setErro(null);
    avisar(`${nome} foi encaminhado para ${NOME_PROFISSIONAL[profissional].toLowerCase()}: ${diaDaSemana(data)}, ${dataCurta(data)}, às ${hora}. Ele vê a consulta no início do app.`, 'sucesso');
  }

  return (
    <>
      <Botao variante={variante} tamanho={tamanho} onClick={() => setAberto(true)} aria-haspopup="dialog" aria-label={`Encaminhar ${atleta.nome}`}>
        <HeartPulse aria-hidden="true" className="size-4.5" />
        Encaminhar
      </Botao>
      <Dialogo aberto={aberto} aoFechar={() => setAberto(false)} titulo={`Encaminhar ${nome}`}>
        <div className="flex flex-col gap-5">
          <Escolha<Profissional>
            nome={`profissional-${atleta.id}`}
            legenda="Profissional"
            valor={profissional}
            aoMudar={setProfissional}
            opcoes={[
              { valor: 'fisio', rotulo: 'Fisioterapeuta', descricao: 'Dor, cansaço, carga' },
              { valor: 'psicologo', rotulo: 'Psicólogo do esporte', descricao: 'Sono, estresse, foco' },
            ]}
          />
          <Escolha<string>
            nome={`horario-${atleta.id}`}
            legenda="Horário no CT"
            valor={horario}
            aoMudar={(v) => { setHorario(v); setErro(null); }}
            erro={erro ?? undefined}
            colunas={3}
            opcoes={dias.flatMap((d) => HORARIOS.map((h) => ({ valor: `${d} ${h}`, rotulo: h, descricao: `${diaDaSemana(d)} ${dataCurta(d)}` })))}
          />
          <CampoAreaTexto id={`motivo-${atleta.id}`} rotulo="Motivo" opcional rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} dica="O atleta e o profissional veem este texto." />
          <div className="flex justify-end gap-2">
            <Botao variante="contorno" onClick={() => setAberto(false)}>Cancelar</Botao>
            <Botao variante="marca" onClick={confirmar}>Confirmar encaminhamento</Botao>
          </div>
        </div>
      </Dialogo>
    </>
  );
}
