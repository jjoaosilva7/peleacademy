import { Link, useParams } from 'react-router';
import { ArrowLeft, UserCheck, UserPlus, UserX } from 'lucide-react';
import { useEstado } from '../../estado/EstadoApp';
import { useDesempenho } from '../../estado/useDesempenho';
import type { Tag } from '../../tipos';
import { calcularIdade, categoriaDoAtleta } from '../../lib/regras';
import { plural, primeiroNome } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { Botao } from '../../componentes/ui/Botao';
import { Pagina, Secao } from '../../componentes/ui/Cartao';
import { Vazio } from '../../componentes/ui/Vazio';
import { useAviso } from '../../componentes/ui/Aviso';
import { CartaoJogador } from '../../componentes/dominio/CartaoJogador';
import { TagsVotaveis } from '../../componentes/dominio/TagsVotaveis';
import { Temporada } from '../../componentes/dominio/Temporada';

function Voltar() {
  return (
    <Link to="/atleta/talentos" className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-superficie text-tinta shadow-folha hover:bg-superficie-2">
      <ArrowLeft aria-hidden="true" className="size-5" />
      <span className="sr-only">Voltar para rede de talentos</span>
    </Link>
  );
}

export function PerfilTalento() {
  const { id } = useParams();
  const { db, hoje, usuario, atletaLogado, alternarSeguir, alternarVotoTag } = useEstado();
  const { atributos } = useDesempenho();
  const avisar = useAviso();
  const atleta = db.atletas.find((a) => a.id === id);
  useTitulo(atleta ? atleta.nome : 'Atleta não encontrado');

  if (!usuario) return null;
  if (!atleta) {
    return (
      <Pagina titulo="Atleta não encontrado" voltar={<Voltar />}>
        <Vazio icone={UserX} titulo="Atleta não encontrado" texto="O perfil pode ter sido removido." />
      </Pagina>
    );
  }

  const segue = usuario.seguindo.includes(atleta.id);
  const seguidores = db.usuarios.filter((u) => u.seguindo.includes(atleta.id)).length;
  const ehProprio = usuario.atletaId === atleta.id;
  const liberado = atletaLogado?.status === 'academia';

  function votar(tag: Tag) {
    const votou = alternarVotoTag(atleta!.id, tag.id);
    avisar(votou ? `Você confirmou "${tag.nome}".` : `Confirmação de "${tag.nome}" removida.`, votou ? 'sucesso' : 'info');
  }

  function seguir() {
    const agora = alternarSeguir(atleta!.id);
    avisar(agora ? `Agora você segue ${primeiroNome(atleta!.nome)}.` : `Você deixou de seguir ${primeiroNome(atleta!.nome)}.`, agora ? 'sucesso' : 'info');
  }

  return (
    <Pagina
      voltar={<Voltar />}
      titulo={atleta.apelido || atleta.nome}
      descricao={
        <>
          {atleta.apelido && <>{atleta.nome}. </>}
          {atleta.posicao}, {calcularIdade(atleta.nascimento, hoje)} anos, {categoriaDoAtleta(atleta, hoje)}. {atleta.cidade} ({atleta.uf}). {plural(seguidores, 'seguidor', 'seguidores')}.
        </>
      }
      acao={
        !ehProprio && (
          <Botao variante={segue ? 'claro' : 'primario'} aria-pressed={segue} onClick={seguir}>
            {segue ? <UserCheck aria-hidden="true" className="size-5" /> : <UserPlus aria-hidden="true" className="size-5" />}
            {segue ? 'Seguindo' : 'Seguir'}
          </Botao>
        )
      }
    >
      <div className="flex justify-center py-2">
        <CartaoJogador atleta={atleta} atributos={atributos(atleta)} tamanho="lg" />
      </div>
      <Secao titulo="Pontos fortes" descricao={ehProprio ? 'Atributos que a rede confirmou sobre você.' : 'Já viu este atleta jogar? Toque em um atributo para confirmar.'}>
        <TagsVotaveis tags={atleta.tags} usuarioId={usuario.id} aoVotar={ehProprio ? undefined : votar} />
      </Secao>
      <Temporada atleta={atleta} jogos={db.jogos} liberado={liberado} />
    </Pagina>
  );
}
