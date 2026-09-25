import { Navigate, useNavigate, useParams } from 'react-router';
import { useEstado } from '../../estado/EstadoApp';
import { calcularNotaFinal } from '../../lib/regras';
import { formatarNumero, primeiroNome } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { Pagina } from '../../componentes/ui/Cartao';
import { useAviso } from '../../componentes/ui/Aviso';
import { FormAvaliacao } from '../../componentes/dominio/FormAvaliacao';
import { Voltar } from './PeneiraDetalhe';

export function RegistrarAvaliacao() {
  const { id } = useParams();
  const { db, registrarAvaliacao } = useEstado();
  const avisar = useAviso();
  const navegar = useNavigate();
  const atleta = db.atletas.find((a) => a.id === id);
  useTitulo(atleta ? `Avaliar ${atleta.nome}` : 'Avaliação');

  if (!atleta || atleta.status !== 'academia') return <Navigate to="/equipe/atletas" replace />;
  const voltarPara = `/equipe/atletas/${atleta.id}`;

  return (
    <Pagina
        voltar={<Voltar para={voltarPara} texto={`Ficha de ${primeiroNome(atleta.nome)}`} />}
        titulo={`Nova avaliação de ${primeiroNome(atleta.nome)}`}
        descricao="Registre a avaliação técnica periódica. Ela entra no gráfico de evolução do atleta."
    >
      <FormAvaliacao
        nomeAtleta={primeiroNome(atleta.nome)}
        modo="academia"
        aoCancelar={() => navegar(voltarPara)}
        aoConcluir={(notas, observacao) => {
          registrarAvaliacao(atleta.id, notas, observacao);
          avisar(`Avaliação de ${primeiroNome(atleta.nome)} salva com nota ${formatarNumero(calcularNotaFinal(notas))}.`, 'sucesso');
          navegar(voltarPara);
        }}
      />
    </Pagina>
  );
}
