import { useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { useEstado } from '../../estado/EstadoApp';
import { dataLonga } from '../../lib/datas';
import { calcularIdade, calcularNotaFinal } from '../../lib/regras';
import { formatarNumero, primeiroNome } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { Pagina } from '../../componentes/ui/Cartao';
import { useAviso } from '../../componentes/ui/Aviso';
import { FormAvaliacao } from '../../componentes/dominio/FormAvaliacao';
import { Voltar } from './PeneiraDetalhe';
import { FotoJogador } from '../../componentes/dominio/FotoJogador';

export function AvaliarCandidato() {
  const { inscricaoId } = useParams();
  const { db, hoje, avaliarInscricao } = useEstado();
  const avisar = useAviso();
  const navegar = useNavigate();
  const concluida = useRef(false);
  const inscricao = db.inscricoes.find((i) => i.id === inscricaoId);
  const atleta = inscricao && db.atletas.find((a) => a.id === inscricao.atletaId);
  const peneira = inscricao && db.peneiras.find((p) => p.id === inscricao.peneiraId);
  useTitulo(atleta ? `Avaliar ${atleta.nome}` : 'Avaliação');

  // Depois de concluir, o status muda; a ref evita redirecionar para a lista antes da navegação terminar.
  if (concluida.current) return null;
  if (!inscricao || !atleta || !peneira || inscricao.status !== 'inscrito') return <Navigate to="/equipe/peneiras" replace />;

  return (
    <Pagina
        voltar={<Voltar para={`/equipe/peneiras/${peneira.id}`} texto={`Peneira ${peneira.categoria}`} />}
        titulo={`Avaliar ${atleta.nome}`}
        descricao={`${atleta.posicao}, ${calcularIdade(atleta.nascimento, hoje)} anos, ${atleta.cidade} (${atleta.uf}). Peneira de ${dataLonga(peneira.data)}.`}
        acao={<FotoJogador atleta={atleta} tamanho="lg" />}
    >
      <FormAvaliacao
        nomeAtleta={primeiroNome(atleta.nome)}
        modo="peneira"
        aoCancelar={() => navegar(`/equipe/peneiras/${peneira.id}`)}
        aoConcluir={(notas, observacao, decisao) => {
          concluida.current = true;
          avaliarInscricao(inscricao.id, notas, observacao, decisao ?? 'reprovado');
          const nota = formatarNumero(calcularNotaFinal(notas));
          avisar(
            decisao === 'aprovado'
              ? `${primeiroNome(atleta.nome)} foi aprovado com nota ${nota} e agora é atleta da academia.`
              : `Avaliação de ${primeiroNome(atleta.nome)} registrada com nota ${nota}.`,
            'sucesso',
          );
          navegar(`/equipe/peneiras/${peneira.id}`);
        }}
      />
    </Pagina>
  );
}
