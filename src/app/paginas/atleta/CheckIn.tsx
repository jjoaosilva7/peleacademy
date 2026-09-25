import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router';
import { useEstado } from '../../estado/EstadoApp';
import type { CheckIn as TipoCheckIn } from '../../tipos';
import { dataCurta, dataLonga, diaDaSemana } from '../../lib/datas';
import { cargaDoTreino, checkinDoDia, classificarBemEstar, indiceBemEstar, ultimosCheckins } from '../../lib/regras';
import { formatarNumero } from '../../lib/texto';
import { useTitulo } from '../../lib/useTitulo';
import { Botao, LinkBotao } from '../../componentes/ui/Botao';
import { Pagina, Secao } from '../../componentes/ui/Cartao';
import { CampoTexto } from '../../componentes/ui/Campo';
import { Escolha } from '../../componentes/ui/Escolha';
import { useAviso } from '../../componentes/ui/Aviso';
import { EtiquetaBemEstar } from '../../componentes/dominio/Status';

type Respostas = { sono: number | null; dor: number | null; cansaco: number | null; estresse: number | null; esforco: number | null; minutos: string };

const PERGUNTAS: { campo: 'sono' | 'dor' | 'cansaco' | 'estresse'; legenda: string; extremos: [string, string] }[] = [
  { campo: 'sono', legenda: 'Como você dormiu esta noite?', extremos: ['1: muito mal', '5: muito bem'] },
  { campo: 'dor', legenda: 'Você sente dor muscular?', extremos: ['1: muita dor', '5: nenhuma dor'] },
  { campo: 'cansaco', legenda: 'Como está seu cansaço?', extremos: ['1: exausto', '5: descansado'] },
  { campo: 'estresse', legenda: 'Como está seu nível de estresse?', extremos: ['1: muito estressado', '5: tranquilo'] },
];

const UM_A_CINCO = [1, 2, 3, 4, 5].map((n) => ({ valor: n, rotulo: n }));
const ZERO_A_DEZ = Array.from({ length: 11 }, (_, n) => ({ valor: n, rotulo: n }));

export function CheckIn() {
  useTitulo('Check-in do dia');
  const { hoje, atletaLogado, registrarCheckin } = useEstado();
  const avisar = useAviso();
  const [editando, setEditando] = useState(false);
  const [respostas, setRespostas] = useState<Respostas>({ sono: null, dor: null, cansaco: null, estresse: null, esforco: null, minutos: '' });
  const [erros, setErros] = useState<Partial<Record<keyof Respostas, string>>>({});

  if (!atletaLogado) return null;
  if (atletaLogado.status !== 'academia') return <Navigate to="/atleta" replace />;

  const feito = checkinDoDia(atletaLogado, hoje);
  const historico = ultimosCheckins(atletaLogado, 7).filter((c) => c.data !== hoje).reverse();
  const bemEstarParcial =
    respostas.sono && respostas.dor && respostas.cansaco && respostas.estresse
      ? indiceBemEstar({ sono: respostas.sono, dor: respostas.dor, cansaco: respostas.cansaco, estresse: respostas.estresse })
      : null;
  const minutos = Number(respostas.minutos);
  const cargaParcial = respostas.esforco !== null && minutos > 0 ? cargaDoTreino({ esforco: respostas.esforco, minutos }) : null;

  function responder<K extends keyof Respostas>(campo: K, valor: Respostas[K]) {
    setRespostas((r) => ({ ...r, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const novos: typeof erros = {};
    for (const p of PERGUNTAS) if (respostas[p.campo] === null) novos[p.campo] = 'Escolha uma opção de 1 a 5.';
    if (!Number.isInteger(minutos) || minutos < 10 || minutos > 240) novos.minutos = 'Informe a duração do treino entre 10 e 240 minutos.';
    if (respostas.esforco === null) novos.esforco = 'Escolha o esforço do treino de 0 a 10.';
    setErros(novos);
    const primeiro = (Object.keys(novos) as (keyof Respostas)[])[0];
    if (primeiro) {
      const alvo = primeiro === 'minutos' ? document.getElementById('minutos') : document.querySelector<HTMLInputElement>(`input[name="${primeiro}"]`);
      alvo?.focus();
      return;
    }
    const registro: Omit<TipoCheckIn, 'data'> = {
      sono: respostas.sono!, dor: respostas.dor!, cansaco: respostas.cansaco!, estresse: respostas.estresse!, esforco: respostas.esforco!, minutos,
    };
    registrarCheckin(registro);
    setEditando(false);
    const nivel = classificarBemEstar(indiceBemEstar(registro));
    if (nivel === 'baixo') avisar('Check-in enviado. Seu bem-estar está baixo hoje e a comissão técnica foi avisada.', 'atencao');
    else avisar('Check-in enviado. Bom treino!', 'sucesso');
  }

  const mostrarFormulario = !feito || editando;

  return (
    <Pagina titulo="Check-in do dia" descricao={`${dataLonga(hoje)}. Responda antes e depois do treino: leva menos de um minuto.`}>

      {mostrarFormulario ? (
        <form noValidate onSubmit={enviar} className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Secao titulo="Antes do treino">
              <div className="flex flex-col gap-6">
                {PERGUNTAS.map((p) => (
                  <Escolha key={p.campo} nome={p.campo} legenda={p.legenda} opcoes={UM_A_CINCO} valor={respostas[p.campo]} aoMudar={(v) => responder(p.campo, v)} extremos={p.extremos} erro={erros[p.campo]} />
                ))}
              </div>
            </Secao>
            <Secao titulo="Depois do treino">
              <div className="flex flex-col gap-6">
                <CampoTexto id="minutos" rotulo="Duração do treino (minutos)" type="number" inputMode="numeric" min={10} max={240} value={respostas.minutos} onChange={(e) => responder('minutos', e.target.value)} erro={erros.minutos} className="max-w-xs" />
                <Escolha nome="esforco" legenda="Quanto esforço o treino exigiu?" opcoes={ZERO_A_DEZ} valor={respostas.esforco} aoMudar={(v) => responder('esforco', v)} extremos={['0: repouso', '10: esforço máximo']} erro={erros.esforco} colunas={6} />
              </div>
            </Secao>
          </div>

          <aside aria-labelledby="titulo-resumo" className="lg:col-span-1">
            <div className="rounded-md border border-linha bg-superficie p-5 md:p-6 lg:sticky lg:top-6">
              <h2 id="titulo-resumo" className="text-2xl text-tinta">Resumo</h2>
              <dl className="mt-4 flex flex-col gap-4">
                <div>
                  <dt className="text-sm font-semibold text-tinta-suave">Bem-estar</dt>
                  <dd className="font-display text-4xl font-bold text-tinta">
                    {bemEstarParcial ?? '–'}<span className="ml-1 font-sans text-base font-semibold text-tinta-suave">de 20</span>
                  </dd>
                  {bemEstarParcial !== null && <dd className="mt-1"><EtiquetaBemEstar nivel={classificarBemEstar(bemEstarParcial)} /></dd>}
                </div>
                <div>
                  <dt className="text-sm font-semibold text-tinta-suave">Carga do treino</dt>
                  <dd className="font-display text-4xl font-bold text-tinta">
                    {cargaParcial !== null ? formatarNumero(cargaParcial, 0) : '–'}<span className="ml-1 font-sans text-base font-semibold text-tinta-suave">UA</span>
                  </dd>
                  <dd className="mt-1 text-sm text-tinta-suave">Esforço multiplicado pelos minutos de treino.</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-col gap-2">
                <Botao type="submit" variante="marca">Enviar check-in</Botao>
                {editando && <Botao variante="contorno" onClick={() => setEditando(false)}>Cancelar</Botao>}
              </div>
            </div>
          </aside>
        </form>
      ) : (
        <Secao titulo="Check-in enviado">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-5xl font-bold text-tinta">
              {indiceBemEstar(feito)}<span className="ml-1 font-sans text-base font-semibold text-tinta-suave">de 20</span>
            </p>
            <EtiquetaBemEstar nivel={classificarBemEstar(indiceBemEstar(feito))} />
          </div>
          <p className="mt-2 text-tinta">
            Treino de {feito.minutos} minutos com esforço {feito.esforco}, carga de {formatarNumero(cargaDoTreino(feito), 0)} UA.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <LinkBotao to="/atleta/evolucao" variante="marca">Ver minha evolução</LinkBotao>
            <Botao
              variante="contorno"
              onClick={() => {
                setRespostas({ sono: feito.sono, dor: feito.dor, cansaco: feito.cansaco, estresse: feito.estresse, esforco: feito.esforco, minutos: String(feito.minutos) });
                setEditando(true);
              }}
            >
              Corrigir respostas
            </Botao>
          </div>
        </Secao>
      )}

      <Secao titulo="Últimos dias">
        {historico.length === 0 ? (
          <p className="text-tinta-suave">Seus check-ins anteriores aparecem aqui.</p>
        ) : (
          <ul className="divide-y divide-linha">
            {historico.map((c) => (
              <li key={c.data} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <p className="font-semibold text-tinta">
                  {diaDaSemana(c.data)}, {dataCurta(c.data)}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-tinta-suave">{formatarNumero(cargaDoTreino(c), 0)} UA</span>
                  <EtiquetaBemEstar nivel={classificarBemEstar(indiceBemEstar(c))} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Secao>
    </Pagina>
  );
}
