import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { LogOut } from 'lucide-react';
import { useEstado } from '../../estado/EstadoApp';
import { useDesempenho } from '../../estado/useDesempenho';
import type { Nacionalidade } from '../../tipos';
import { dataLonga } from '../../lib/datas';
import { calcularIdade, categoriaDoAtleta, NACIONALIDADES, validarApelido } from '../../lib/regras';
import { formatarTelefone } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { Botao } from '../../componentes/ui/Botao';
import { Pagina, Secao } from '../../componentes/ui/Cartao';
import { CampoSelecao, CampoTexto } from '../../componentes/ui/Campo';
import { useAviso } from '../../componentes/ui/Aviso';
import { CartaoJogador } from '../../componentes/dominio/CartaoJogador';
import { BotaoFoto } from '../../componentes/dominio/FotoPendente';
import { TagsVotaveis } from '../../componentes/dominio/TagsVotaveis';
import { Temporada } from '../../componentes/dominio/Temporada';

function Item({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-tinta-suave">{rotulo}</dt>
      <dd className="text-tinta">{valor}</dd>
    </div>
  );
}

export function MeuPerfil() {
  useTitulo('Meu perfil');
  const { db, hoje, usuario, atletaLogado: atleta, sair, salvarPerfil } = useEstado();
  const { atributos } = useDesempenho();
  const avisar = useAviso();
  const [apelido, setApelido] = useState(atleta?.apelido ?? '');
  const [pais, setPais] = useState<Nacionalidade>(atleta?.nacionalidade ?? 'Brasil');
  const [erro, setErro] = useState<string | null>(null);
  if (!usuario || !atleta) return null;

  function salvar(evento: FormEvent) {
    evento.preventDefault();
    const problema = validarApelido(apelido);
    setErro(problema);
    if (problema) {
      document.getElementById('apelido-perfil')?.focus();
      return;
    }
    salvarPerfil(atleta!.id, { apelido, nacionalidade: pais });
    avisar(apelido.trim() ? `Pronto. Agora você aparece como ${apelido.trim()}.` : 'Perfil salvo.', 'sucesso');
  }

  return (
    <Pagina
      titulo="Meu perfil"
      descricao={usuario.email}
      acao={<BotaoFoto atleta={atleta} variante="claro" />}
    >
      <div className="flex justify-center py-2">
        <CartaoJogador atleta={atleta} atributos={atributos(atleta)} tamanho="lg" />
      </div>
      <Secao titulo="Como você aparece" descricao="O apelido vai no seu cartão, nas escalações e na lista do treinador.">
        <form noValidate onSubmit={salvar} className="grid gap-4 sm:grid-cols-3 sm:items-start">
          <CampoTexto id="apelido-perfil" rotulo="Apelido" maxLength={16} value={apelido} onChange={(e) => setApelido(e.target.value)} erro={erro ?? undefined} dica="Até 16 caracteres." />
          <CampoSelecao id="pais-perfil" rotulo="País" value={pais} onChange={(e) => setPais(e.target.value as Nacionalidade)}>
            {NACIONALIDADES.map((n) => <option key={n} value={n}>{n}</option>)}
          </CampoSelecao>
          <Botao type="submit" variante="marca" className="sm:mt-7">Salvar</Botao>
        </form>
      </Secao>

      {atleta.status === 'academia' && <Temporada atleta={atleta} jogos={db.jogos} liberado />}

      <div className="grid gap-5 md:grid-cols-2 md:gap-6 [&>*]:min-w-0">
        <Secao titulo="Dados esportivos">
          <dl className="grid grid-cols-2 gap-4">
            <Item rotulo="Posição" valor={atleta.posicao} />
            <Item rotulo="Pé dominante" valor={atleta.pe} />
            <Item rotulo="Idade" valor={`${calcularIdade(atleta.nascimento, hoje)} anos`} />
            <Item rotulo="Categoria" valor={categoriaDoAtleta(atleta, hoje) ?? 'Indefinida'} />
            <Item rotulo="Altura" valor={atleta.alturaCm ? `${atleta.alturaCm} cm` : 'Não informada'} />
            <Item rotulo="Peso" valor={atleta.pesoKg ? `${atleta.pesoKg} kg` : 'Não informado'} />
            <Item rotulo="Cidade" valor={`${atleta.cidade} (${atleta.uf})`} />
            {atleta.desde && <Item rotulo="Na academia desde" valor={dataLonga(atleta.desde)} />}
          </dl>
        </Secao>
        <Secao titulo="Responsável">
          {atleta.responsavel ? (
            <dl className="grid gap-4">
              <Item rotulo="Nome" valor={atleta.responsavel.nome} />
              <Item rotulo="E-mail" valor={atleta.responsavel.email} />
              <Item rotulo="Telefone" valor={formatarTelefone(atleta.responsavel.telefone)} />
            </dl>
          ) : (
            <p className="text-tinta-suave">Não é necessário para atletas com 18 anos ou mais.</p>
          )}
        </Secao>
      </div>

      <Secao titulo="Pontos fortes confirmados pela rede">
        <TagsVotaveis tags={atleta.tags} usuarioId={usuario.id} />
        <p className="mt-4 text-tinta-suave">
          Veja também <Link to={`/atleta/talentos/${atleta.id}`} className="font-semibold text-realce underline underline-offset-4 hover:no-underline">seu perfil público</Link>.
        </p>
      </Secao>

      <div>
        <Botao variante="perigo" onClick={sair}>
          <LogOut aria-hidden="true" className="size-5" />
          Sair da conta
        </Botao>
      </div>
    </Pagina>
  );
}
