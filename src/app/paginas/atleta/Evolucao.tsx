import { Navigate } from 'react-router';
import { useEstado } from '../../estado/EstadoApp';
import { useTitulo } from '../../lib/useTitulo';
import { Pagina } from '../../componentes/ui/Cartao';
import { PainelCarga, PainelEvolucao, PainelOverall, PainelTreinos } from '../../componentes/dominio/Paineis';

export function Evolucao() {
  useTitulo('Minha evolução');
  const { db, atletaLogado: atleta } = useEstado();
  if (!atleta) return null;
  if (atleta.status !== 'academia') return <Navigate to="/atleta" replace />;

  return (
    <Pagina titulo="Minha evolução" descricao="Seu overall, as notas de cada treino, as avaliações técnicas e a carga dos treinos.">
      <PainelOverall atleta={atleta} treinos={db.treinos} />
      <PainelTreinos atleta={atleta} treinos={db.treinos} />
      {atleta.avaliacoes.length > 0 && <PainelEvolucao atleta={atleta} />}
      <PainelCarga atleta={atleta} />
    </Pagina>
  );
}
