import { useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { CalendarDays, SearchX } from 'lucide-react';
import { useEstado } from '../../estado/EstadoApp';
import { dataLonga } from '../../lib/datas';
import { calcularNotaFinal, CATEGORIAS, categoriaDoAtleta, vagasRestantes, verificarInscricao } from '../../lib/regras';
import { formatarNumero, normalizar, plural } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { Botao } from '../../componentes/ui/Botao';
import { Pagina, Secao } from '../../componentes/ui/Cartao';
import { ComoChegar } from '../../componentes/dominio/ComoChegar';
import { CampoSelecao, CampoTexto } from '../../componentes/ui/Campo';
import { Abas, PainelAba } from '../../componentes/ui/Abas';
import { Vazio } from '../../componentes/ui/Vazio';
import { useAviso } from '../../componentes/ui/Aviso';
import { CartaoPeneira } from '../../componentes/dominio/CartaoPeneira';
import { EtiquetaInscricao } from '../../componentes/dominio/Status';

export function Peneiras() {
  useTitulo('Peneiras');
  const { db, hoje, atletaLogado, inscrever } = useEstado();
  const avisar = useAviso();
  const [parametros, setParametros] = useSearchParams();
  const aba = parametros.get('aba') === 'inscricoes' ? 'inscricoes' : 'procurar';
  const minhaCategoria = atletaLogado ? categoriaDoAtleta(atletaLogado, hoje) : null;
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<string>(minhaCategoria ?? '');
  const [uf, setUf] = useState('');

  const futuras = useMemo(
    () => db.peneiras.filter((p) => p.data >= hoje).sort((a, b) => a.data.localeCompare(b.data)),
    [db.peneiras, hoje],
  );
  const estados = [...new Set(futuras.map((p) => p.uf))].sort();

  if (!atletaLogado) return null;
  if (atletaLogado.status === 'academia') return <Navigate to="/atleta" replace />;

  const termo = normalizar(busca.trim());
  const filtradas = futuras.filter(
    (p) =>
      (!categoria || p.categoria === categoria) &&
      (!uf || p.uf === uf) &&
      (!termo || normalizar(`${p.cidade} ${p.local}`).includes(termo)),
  );

  const minhas = db.inscricoes
    .filter((i) => i.atletaId === atletaLogado.id)
    .map((i) => ({ inscricao: i, peneira: db.peneiras.find((p) => p.id === i.peneiraId)! }))
    .sort((a, b) => b.peneira.data.localeCompare(a.peneira.data));

  function mudarAba(id: string) {
    setParametros(id === 'inscricoes' ? { aba: 'inscricoes' } : {}, { replace: true });
  }

  function limparFiltros() {
    setBusca('');
    setCategoria('');
    setUf('');
  }

  function aoInscrever(peneiraId: string) {
    const peneira = db.peneiras.find((p) => p.id === peneiraId)!;
    const resultado = inscrever(peneiraId);
    if (resultado.ok) avisar(`Inscrição feita na peneira ${peneira.categoria} de ${dataLonga(peneira.data)}.`, 'sucesso');
    else avisar(resultado.mensagem, 'erro');
  }

  return (
    <Pagina titulo="Peneiras" descricao="Encontre peneiras da sua categoria, inscreva-se e veja como chegar ao local.">
      <Secao>
      <Abas
        rotulo="Peneiras"
        ativa={aba}
        aoMudar={mudarAba}
        abas={[
          { id: 'procurar', rotulo: 'Procurar' },
          { id: 'inscricoes', rotulo: `Minhas inscrições (${minhas.length})` },
        ]}
      />

      {aba === 'procurar' ? (
        <PainelAba id="procurar">
          <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CampoTexto id="busca-peneira" rotulo="Cidade ou local" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} className="sm:col-span-2" />
            <CampoSelecao id="filtro-categoria" rotulo="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="">Todas</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}{c === minhaCategoria ? ' (a sua)' : ''}</option>
              ))}
            </CampoSelecao>
            <CampoSelecao id="filtro-uf" rotulo="Estado" value={uf} onChange={(e) => setUf(e.target.value)}>
              <option value="">Todos</option>
              {estados.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </CampoSelecao>
          </form>

          <h2 aria-live="polite" className="mb-4 mt-6 font-sans text-base font-semibold text-tinta-suave">
            {plural(filtradas.length, 'peneira encontrada', 'peneiras encontradas')}
          </h2>

          {filtradas.length === 0 ? (
            <Vazio
              icone={SearchX}
              titulo="Nenhuma peneira com esses filtros"
              texto="Tente outra cidade ou mostre todas as categorias."
              acao={<Botao variante="contorno" onClick={limparFiltros}>Limpar filtros</Botao>}
            />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {filtradas.map((p) => {
                const verificacao = verificarInscricao(atletaLogado, p, db.inscricoes, hoje);
                const inscrito = db.inscricoes.some((i) => i.peneiraId === p.id && i.atletaId === atletaLogado.id);
                return (
                  <li key={p.id} className="flex">
                    <div className="flex-1">
                      <CartaoPeneira
                        peneira={p}
                        vagas={vagasRestantes(p, db.inscricoes)}
                        inscrito={inscrito}
                        motivoBloqueio={verificacao.permitido ? undefined : verificacao.motivo}
                        aoInscrever={() => aoInscrever(p.id)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </PainelAba>
      ) : (
        <PainelAba id="inscricoes">
          {minhas.length === 0 ? (
            <Vazio
              icone={CalendarDays}
              titulo="Você ainda não se inscreveu"
              texto="Procure uma peneira da sua categoria para começar."
              acao={<Botao variante="marca" onClick={() => mudarAba('procurar')}>Procurar peneiras</Botao>}
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {minhas.map(({ inscricao, peneira }) => {
                const avaliacao = atletaLogado.avaliacoes.find((a) => a.id === inscricao.avaliacaoId);
                return (
                  <li key={inscricao.id} className="rounded-md border border-linha p-4 md:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-2xl text-tinta">Peneira {peneira.categoria}</h2>
                        <p className="text-tinta-suave">{dataLonga(peneira.data)}, {peneira.local}, {peneira.cidade} ({peneira.uf})</p>
                      </div>
                      <EtiquetaInscricao inscricao={inscricao} peneira={peneira} hoje={hoje} />
                    </div>
                    {inscricao.status === 'inscrito' && peneira.data >= hoje && (
                      <div className="mt-4 border-t border-linha pt-4"><ComoChegar peneira={peneira} /></div>
                    )}
                    {inscricao.status === 'inscrito' && peneira.data < hoje && (
                      <p className="mt-3 text-tinta">A equipe técnica está avaliando sua participação. Você recebe o resultado aqui.</p>
                    )}
                    {avaliacao && (
                      <div className="mt-4 rounded-lg bg-superficie-2 p-4">
                        <p className="font-semibold text-tinta">Nota final: {formatarNumero(calcularNotaFinal(avaliacao.notas))}</p>
                        {avaliacao.observacao && <p className="mt-1 text-tinta">{avaliacao.observacao}</p>}
                        <p className="mt-1 text-sm text-tinta-suave">Avaliação de {avaliacao.avaliador}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </PainelAba>
      )}
      </Secao>
    </Pagina>
  );
}
