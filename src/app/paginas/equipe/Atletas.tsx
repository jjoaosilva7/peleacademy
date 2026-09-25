import { useState } from 'react';
import { Star, UsersRound } from 'lucide-react';
import { useEstado } from '../../estado/EstadoApp';
import { useDesempenho } from '../../estado/useDesempenho';
import { listarAlertas, POSICOES } from '../../lib/regras';
import { treinosDoAtleta } from '../../lib/desempenho';
import { verificarCuidado } from '../../lib/cuidado';
import { normalizar, plural, primeiroNome } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { Botao } from '../../componentes/ui/Botao';
import { Pagina, Secao } from '../../componentes/ui/Cartao';
import { CampoSelecao, CampoTexto } from '../../componentes/ui/Campo';
import { Etiqueta } from '../../componentes/ui/Etiqueta';
import { Vazio } from '../../componentes/ui/Vazio';
import { useAviso } from '../../componentes/ui/Aviso';
import { CartaoAtleta } from '../../componentes/dominio/CartaoAtleta';
import { NotaChip } from '../../componentes/dominio/NotaChip';

export function Atletas() {
  useTitulo('Atletas');
  const { db, hoje, usuario, alternarSeguir } = useEstado();
  const { overall } = useDesempenho();
  const avisar = useAviso();
  const [busca, setBusca] = useState('');
  const [posicao, setPosicao] = useState('');
  const [uf, setUf] = useState('');
  const [situacao, setSituacao] = useState('');
  const [ordem, setOrdem] = useState('atencao');
  const [soFavoritos, setSoFavoritos] = useState(false);

  if (!usuario) return null;
  const estados = [...new Set(db.atletas.map((a) => a.uf))].sort();
  const termo = normalizar(busca.trim());
  const lista = db.atletas
    .map((a) => ({
      atleta: a,
      alertas: listarAlertas(a, hoje).length + (verificarCuidado(a, db.treinos) ? 1 : 0),
      ultimo: treinosDoAtleta(a.id, db.treinos).at(-1),
      ovr: overall(a),
    }))
    .filter(
      ({ atleta: a }) =>
        (!termo || normalizar(`${a.nome} ${a.apelido ?? ''}`).includes(termo)) &&
        (!posicao || a.posicao === posicao) &&
        (!uf || a.uf === uf) &&
        (!situacao || a.status === situacao) &&
        (!soFavoritos || usuario.seguindo.includes(a.id)),
    )
    .sort((x, y) =>
      ordem === 'overall' ? y.ovr - x.ovr
        : ordem === 'nome' ? x.atleta.nome.localeCompare(y.atleta.nome)
        : y.alertas - x.alertas || y.ovr - x.ovr,
    );

  function limpar() {
    setBusca(''); setPosicao(''); setUf(''); setSituacao(''); setSoFavoritos(false);
  }

  function favoritar(id: string, nome: string) {
    const agora = alternarSeguir(id);
    avisar(agora ? `${primeiroNome(nome)} adicionado aos favoritos.` : `${primeiroNome(nome)} removido dos favoritos.`, agora ? 'sucesso' : 'info');
  }

  return (
    <Pagina titulo="Atletas" descricao="Elenco da academia e candidatos das peneiras, com overall, nota do último treino e alertas.">
      <Secao>
        <form role="search" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <CampoTexto id="busca-equipe" rotulo="Nome ou apelido" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} />
            <CampoSelecao id="filtro-situacao" rotulo="Situação" value={situacao} onChange={(e) => setSituacao(e.target.value)}>
              <option value="">Todos</option>
              <option value="academia">Na academia</option>
              <option value="candidato">Candidatos</option>
            </CampoSelecao>
            <CampoSelecao id="filtro-posicao-equipe" rotulo="Posição" value={posicao} onChange={(e) => setPosicao(e.target.value)}>
              <option value="">Todas</option>
              {POSICOES.map((p) => <option key={p} value={p}>{p}</option>)}
            </CampoSelecao>
            <CampoSelecao id="filtro-uf-equipe" rotulo="Estado" value={uf} onChange={(e) => setUf(e.target.value)}>
              <option value="">Todos</option>
              {estados.map((e) => <option key={e} value={e}>{e}</option>)}
            </CampoSelecao>
            <CampoSelecao id="ordem-equipe" rotulo="Ordenar por" value={ordem} onChange={(e) => setOrdem(e.target.value)}>
              <option value="atencao">Precisam de atenção</option>
              <option value="overall">Maior overall</option>
              <option value="nome">Nome</option>
            </CampoSelecao>
          </div>
          <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 font-semibold text-tinta">
            <input type="checkbox" checked={soFavoritos} onChange={(e) => setSoFavoritos(e.target.checked)} className="size-5 accent-marca" />
            Só favoritos
          </label>
        </form>

        <h2 aria-live="polite" className="mt-4 border-t border-linha pt-4 font-sans text-base font-semibold text-tinta-suave">{plural(lista.length, 'atleta', 'atletas')}</h2>

        {lista.length === 0 ? (
          <div className="mt-4"><Vazio icone={UsersRound} titulo="Nenhum atleta com esses filtros" acao={<Botao variante="contorno" onClick={limpar}>Limpar filtros</Botao>} /></div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {lista.map(({ atleta, alertas, ultimo, ovr }, i) => {
              const favorito = usuario.seguindo.includes(atleta.id);
              return (
                <li key={atleta.id}>
                  <CartaoAtleta
                    atleta={atleta}
                    hoje={hoje}
                    overall={ovr}
                    indice={i}
                    destino={`/equipe/atletas/${atleta.id}`}
                    rodape={
                      <>
                        {ultimo && <NotaChip nota={ultimo.nota} tamanho="sm" rotulo="Último treino" />}
                        {alertas > 0 && <Etiqueta tom="atencao">{plural(alertas, 'alerta', 'alertas')}</Etiqueta>}
                        {atleta.status === 'candidato' && <Etiqueta>Candidato</Etiqueta>}
                        <Botao variante="fantasma" tamanho="sm" className="ml-auto" aria-pressed={favorito} aria-label={`Favoritar ${atleta.nome}`} onClick={() => favoritar(atleta.id, atleta.nome)}>
                          <Star aria-hidden="true" className={`size-5 ${favorito ? 'fill-acento-forte text-acento-forte' : ''}`} />
                        </Botao>
                      </>
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
