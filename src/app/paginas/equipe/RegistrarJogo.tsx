import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useEstado } from '../../estado/EstadoApp';
import type { Categoria, EstatisticaJogo } from '../../tipos';
import { CATEGORIAS, categoriaDoAtleta } from '../../lib/regras';
import { SETOR_DA_POSICAO, SIGLA_POSICAO, validarJogo } from '../../lib/desempenho';
import { useTitulo } from '../../lib/useTitulo';
import { Botao } from '../../componentes/ui/Botao';
import { Pagina, Secao } from '../../componentes/ui/Cartao';
import { CampoSelecao, CampoTexto } from '../../componentes/ui/Campo';
import { Escolha } from '../../componentes/ui/Escolha';
import { useAviso } from '../../componentes/ui/Aviso';
import { Contador } from '../../componentes/dominio/Contador';
import { FotoJogador } from '../../componentes/dominio/FotoJogador';
import { Voltar } from './PeneiraDetalhe';

type Linha = EstatisticaJogo & { jogou: boolean };

export function RegistrarJogo() {
  useTitulo('Registrar jogo');
  const { db, hoje, registrarJogo } = useEstado();
  const avisar = useAviso();
  const navegar = useNavigate();
  const categorias = CATEGORIAS.filter((c) => db.atletas.some((a) => a.status === 'academia' && categoriaDoAtleta(a, hoje) === c));
  const [categoria, setCategoria] = useState<Categoria>(categorias.includes('Sub-17') ? 'Sub-17' : categorias[0]);
  const [data, setData] = useState(hoje);
  const [adversario, setAdversario] = useState('');
  const [mando, setMando] = useState<'casa' | 'fora'>('casa');
  const [golsPro, setGolsPro] = useState('0');
  const [golsContra, setGolsContra] = useState('0');
  const [erros, setErros] = useState<Record<string, string>>({});
  const elencoDe = (c: Categoria) => db.atletas.filter((a) => a.status === 'academia' && categoriaDoAtleta(a, hoje) === c);
  const linhasPara = (c: Categoria): Record<string, Linha> =>
    Object.fromEntries(elencoDe(c).map((a) => [a.id, { atletaId: a.id, jogou: false, gols: 0, assistencias: 0, desarmes: 0, defesas: 0 }]));
  const [linhas, setLinhas] = useState<Record<string, Linha>>(() => linhasPara(categoria));
  const elenco = elencoDe(categoria).sort((a, b) => ['GOL', 'DEF', 'MEI', 'ATA'].indexOf(SETOR_DA_POSICAO[a.posicao]) - ['GOL', 'DEF', 'MEI', 'ATA'].indexOf(SETOR_DA_POSICAO[b.posicao]));

  function mudar(id: string, campo: keyof Omit<Linha, 'atletaId'>, valor: number | boolean) {
    setLinhas((l) => ({ ...l, [id]: { ...l[id], [campo]: valor, ...(campo !== 'jogou' ? { jogou: true } : {}) } }));
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const novos: Record<string, string> = {};
    const gp = Number(golsPro);
    const gc = Number(golsContra);
    if (!adversario.trim()) novos.adversario = 'Informe o adversário.';
    if (!data || data > hoje) novos.data = 'Informe a data do jogo (hoje ou antes).';
    if (!Number.isInteger(gp) || gp < 0 || gp > 30) novos.golsPro = 'Informe um número de 0 a 30.';
    if (!Number.isInteger(gc) || gc < 0 || gc > 30) novos.golsContra = 'Informe um número de 0 a 30.';
    const jogaram = Object.values(linhas).filter((l) => l.jogou);
    if (jogaram.length === 0) novos.elenco = 'Marque quem jogou.';
    const inconsistencia = validarJogo(gp, jogaram);
    if (!novos.golsPro && inconsistencia) novos.elenco = inconsistencia;
    setErros(novos);
    const primeiro = ['adversario', 'data', 'golsPro', 'golsContra', 'elenco'].find((c) => novos[c]);
    if (primeiro) {
      document.getElementById(primeiro === 'elenco' ? 'erro-elenco' : primeiro)?.focus();
      return;
    }
    registrarJogo({
      data, categoria, adversario: adversario.trim(), mando, golsPro: gp, golsContra: gc,
      estatisticas: jogaram.map(({ atletaId, gols, assistencias, desarmes, defesas }) => ({ atletaId, gols, assistencias, desarmes, defesas })),
    });
    avisar(`Jogo contra ${adversario.trim()} registrado. As estatísticas já estão no perfil de ${jogaram.length} atletas.`, 'sucesso');
    navegar('/equipe/jogos');
  }

  return (
    <Pagina titulo="Registrar jogo" voltar={<Voltar para="/equipe/jogos" texto="Jogos" />} descricao="Marque quem jogou e lance os números de cada um.">
      <form noValidate onSubmit={enviar} className="flex flex-col gap-5 md:gap-6">
        <Secao titulo="Partida">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CampoSelecao id="categoria-jogo" rotulo="Categoria" value={categoria} onChange={(e) => { const c = e.target.value as Categoria; setCategoria(c); setLinhas(linhasPara(c)); }}>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </CampoSelecao>
            <CampoTexto id="data" rotulo="Data" type="date" max={hoje} value={data} onChange={(e) => setData(e.target.value)} erro={erros.data} />
            <CampoTexto id="adversario" rotulo="Adversário" value={adversario} onChange={(e) => setAdversario(e.target.value)} erro={erros.adversario} />
            <Escolha nome="mando" legenda="Mando" valor={mando} aoMudar={setMando} opcoes={[{ valor: 'casa', rotulo: 'Em casa' }, { valor: 'fora', rotulo: 'Fora' }]} />
            <CampoTexto id="golsPro" rotulo="Gols da academia" type="number" inputMode="numeric" min={0} max={30} value={golsPro} onChange={(e) => setGolsPro(e.target.value)} erro={erros.golsPro} />
            <CampoTexto id="golsContra" rotulo="Gols do adversário" type="number" inputMode="numeric" min={0} max={30} value={golsContra} onChange={(e) => setGolsContra(e.target.value)} erro={erros.golsContra} />
          </div>
        </Secao>

        <Secao titulo="Quem jogou" descricao="Mexer em qualquer número já marca o atleta como relacionado.">
          {erros.elenco && (
            <p id="erro-elenco" tabIndex={-1} role="alert" className="mb-4 rounded-lg border border-erro/40 bg-erro-suave p-3 font-medium text-erro">{erros.elenco}</p>
          )}
          <ul className="divide-y divide-linha">
            {elenco.map((a) => {
              const l = linhas[a.id];
              if (!l) return null;
              const goleiro = a.posicao === 'Goleiro';
              return (
                <li key={a.id} className="py-4 first:pt-0 last:pb-0">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input type="checkbox" checked={l.jogou} onChange={(e) => mudar(a.id, 'jogou', e.target.checked)} className="size-5 accent-marca" />
                    <FotoJogador atleta={a} tamanho="sm" />
                    <span className="min-w-0">
                      <span className="block truncate font-display text-xl font-bold text-tinta">{a.apelido || a.nome}</span>
                      <span className="block text-sm text-tinta-suave">{SIGLA_POSICAO[a.posicao]}{a.numero !== null ? `, camisa ${a.numero}` : ''}</span>
                    </span>
                  </label>
                  {l.jogou && (
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <Contador id={`j-${a.id}-gols`} rotulo="Gols" valor={l.gols} aoMudar={(v) => mudar(a.id, 'gols', v)} />
                      <Contador id={`j-${a.id}-ast`} rotulo="Assistências" valor={l.assistencias} aoMudar={(v) => mudar(a.id, 'assistencias', v)} />
                      {goleiro ? (
                        <Contador id={`j-${a.id}-def`} rotulo="Defesas" valor={l.defesas} aoMudar={(v) => mudar(a.id, 'defesas', v)} />
                      ) : (
                        <Contador id={`j-${a.id}-des`} rotulo="Desarmes" valor={l.desarmes} aoMudar={(v) => mudar(a.id, 'desarmes', v)} />
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Secao>

        <div className="flex justify-end gap-2">
          <Botao variante="contorno" onClick={() => navegar('/equipe/jogos')}>Cancelar</Botao>
          <Botao type="submit" variante="marca">Salvar jogo</Botao>
        </div>
      </form>
    </Pagina>
  );
}
