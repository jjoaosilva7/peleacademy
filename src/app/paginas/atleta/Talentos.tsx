import { useState } from 'react';
import { UserCheck, UserPlus, UsersRound } from 'lucide-react';
import { useEstado } from '../../estado/EstadoApp';
import { POSICOES } from '../../lib/regras';
import { normalizar, plural, primeiroNome } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { Botao } from '../../componentes/ui/Botao';
import { Pagina, Secao } from '../../componentes/ui/Cartao';
import { useDesempenho } from '../../estado/useDesempenho';
import { CampoSelecao, CampoTexto } from '../../componentes/ui/Campo';
import { Vazio } from '../../componentes/ui/Vazio';
import { useAviso } from '../../componentes/ui/Aviso';
import { CartaoAtleta } from '../../componentes/dominio/CartaoAtleta';

export function Talentos() {
  useTitulo('Rede de talentos');
  const { db, hoje, usuario, atletaLogado, alternarSeguir } = useEstado();
  const avisar = useAviso();
  const { overall } = useDesempenho();
  const [busca, setBusca] = useState('');
  const [posicao, setPosicao] = useState('');
  const [uf, setUf] = useState('');
  const [soSeguidos, setSoSeguidos] = useState(false);

  if (!usuario) return null;
  const outros = db.atletas.filter((a) => a.id !== atletaLogado?.id);
  const estados = [...new Set(outros.map((a) => a.uf))].sort();
  const termo = normalizar(busca.trim());
  const lista = outros
    .filter(
      (a) =>
        (!termo || normalizar(a.nome).includes(termo)) &&
        (!posicao || a.posicao === posicao) &&
        (!uf || a.uf === uf) &&
        (!soSeguidos || usuario.seguindo.includes(a.id)),
    )
    .sort((a, b) => a.nome.localeCompare(b.nome));

  function seguir(atletaId: string, nome: string) {
    const agora = alternarSeguir(atletaId);
    avisar(agora ? `Agora você segue ${primeiroNome(nome)}.` : `Você deixou de seguir ${primeiroNome(nome)}.`, agora ? 'sucesso' : 'info');
  }

  return (
    <Pagina titulo="Rede de talentos" descricao="Conheça outros atletas, siga quem você admira e confirme os pontos fortes de cada um.">
      <Secao>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CampoTexto id="busca-atleta" rotulo="Nome do atleta" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <CampoSelecao id="filtro-posicao" rotulo="Posição" value={posicao} onChange={(e) => setPosicao(e.target.value)}>
          <option value="">Todas</option>
          {POSICOES.map((p) => <option key={p} value={p}>{p}</option>)}
        </CampoSelecao>
        <CampoSelecao id="filtro-uf-talentos" rotulo="Estado" value={uf} onChange={(e) => setUf(e.target.value)}>
          <option value="">Todos</option>
          {estados.map((e) => <option key={e} value={e}>{e}</option>)}
        </CampoSelecao>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 self-end font-semibold text-tinta">
          <input type="checkbox" checked={soSeguidos} onChange={(e) => setSoSeguidos(e.target.checked)} className="size-5 accent-marca" />
          Só quem eu sigo
        </label>
      </form>

      <h2 aria-live="polite" className="mb-4 mt-6 font-sans text-base font-semibold text-tinta-suave">{plural(lista.length, 'atleta', 'atletas')}</h2>

      {lista.length === 0 ? (
        <Vazio
          icone={UsersRound}
          titulo="Nenhum atleta encontrado"
          texto={soSeguidos ? 'Você ainda não segue ninguém com esses filtros.' : 'Tente outra posição ou outro estado.'}
          acao={<Botao variante="contorno" onClick={() => { setBusca(''); setPosicao(''); setUf(''); setSoSeguidos(false); }}>Limpar filtros</Botao>}
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {lista.map((a, i) => {
            const segue = usuario.seguindo.includes(a.id);
            return (
              <li key={a.id}>
                <CartaoAtleta
                  atleta={a}
                  hoje={hoje}
                  destino={`/atleta/talentos/${a.id}`}
                  overall={overall(a)}
                  indice={i}
                  rodape={
                    a.id !== usuario.atletaId && (
                      <Botao
                      variante={segue ? 'marca' : 'contorno'}
                      tamanho="sm"
                      aria-pressed={segue}
                      aria-label={`${segue ? 'Seguindo' : 'Seguir'} ${a.nome}`}
                      onClick={() => seguir(a.id, a.nome)}
                    >
                      {segue ? <UserCheck aria-hidden="true" className="size-4" /> : <UserPlus aria-hidden="true" className="size-4" />}
                      <span className="hidden sm:inline">{segue ? 'Seguindo' : 'Seguir'}</span>
                    </Botao>
                    )
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
      </Secao>
    </Pagina>
  );
}
