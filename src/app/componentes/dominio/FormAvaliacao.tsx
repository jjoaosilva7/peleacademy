import { useState } from 'react';
import type { Criterio, Notas } from '../../tipos';
import { calcularNotaFinal, CRITERIOS, NOTA_APROVACAO, sugerirDecisao } from '../../lib/regras';
import { formatarNumero } from '../../lib/texto';
import { Botao } from '../ui/Botao';
import { CampoAreaTexto } from '../ui/Campo';
import { Etiqueta } from '../ui/Etiqueta';

const NOTAS_INICIAIS = CRITERIOS.reduce((acc, c) => ({ ...acc, [c.id]: 5 }), {} as Notas);

type Decisao = 'aprovado' | 'reprovado';

interface Props {
  nomeAtleta: string;
  /** Peneira: técnico decide aprovar ou não. Academia: só registra a avaliação. */
  modo: 'peneira' | 'academia';
  aoConcluir: (notas: Notas, observacao: string, decisao?: Decisao) => void;
  aoCancelar: () => void;
}

export function FormAvaliacao({ nomeAtleta, modo, aoConcluir, aoCancelar }: Props) {
  const [notas, setNotas] = useState<Notas>(NOTAS_INICIAIS);
  const [observacao, setObservacao] = useState('');
  const [confirmando, setConfirmando] = useState<Decisao | null>(null);
  const nota = calcularNotaFinal(notas);
  const sugestao = sugerirDecisao(nota);

  function mudarNota(criterio: Criterio, valor: number) {
    setNotas((atual) => ({ ...atual, [criterio]: valor }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section aria-labelledby="titulo-criterios" className="rounded-md border border-linha bg-superficie p-5 md:p-6 lg:col-span-3">
        <h2 id="titulo-criterios" className="text-2xl text-tinta">Critérios</h2>
        <p className="mt-1 text-tinta-suave">Dê uma nota de 0 a 10 para cada critério observado.</p>
        <div className="mt-5 flex flex-col gap-5">
          {CRITERIOS.map((c) => (
            <div key={c.id}>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={`nota-${c.id}`} className="font-semibold text-tinta">{c.nome}</label>
                <output htmlFor={`nota-${c.id}`} className="font-display text-2xl font-bold text-tinta">
                  {formatarNumero(notas[c.id])}
                </output>
              </div>
              <input
                id={`nota-${c.id}`}
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={notas[c.id]}
                onChange={(e) => mudarNota(c.id, Number(e.target.value))}
                aria-valuetext={`${formatarNumero(notas[c.id])} de 10`}
                className="mt-2 h-2 w-full cursor-pointer accent-marca"
              />
            </div>
          ))}
        </div>
        <CampoAreaTexto
          id="observacao"
          rotulo="Observações para o atleta e a comissão"
          opcional
          rows={4}
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          className="mt-6"
        />
      </section>

      <aside aria-labelledby="titulo-resultado" className="lg:col-span-2">
        <div className="rounded-md border border-linha bg-superficie p-5 md:p-6 lg:sticky lg:top-6">
          <h2 id="titulo-resultado" className="text-2xl text-tinta">Resultado</h2>
          <p className="mt-3 text-sm font-semibold text-tinta-suave">Nota final (média dos critérios)</p>
          <p className="font-display text-numero font-bold text-tinta" aria-live="polite">{formatarNumero(nota)}</p>
          {modo === 'peneira' && (
            <>
              <div className="mt-2"><Etiqueta tom={sugestao.tom}>{sugestao.texto}</Etiqueta></div>
              <p className="mt-2 text-sm text-tinta-suave">A nota mínima sugerida para aprovação é {formatarNumero(NOTA_APROVACAO)}. A decisão final é do técnico.</p>
            </>
          )}

          {modo === 'academia' ? (
            <div className="mt-6 flex flex-col gap-2">
              <Botao variante="marca" onClick={() => aoConcluir(notas, observacao)}>Salvar avaliação</Botao>
              <Botao variante="contorno" onClick={aoCancelar}>Cancelar</Botao>
            </div>
          ) : confirmando ? (
            <div role="alertdialog" aria-labelledby="titulo-confirmacao" aria-describedby="texto-confirmacao" className="mt-6 rounded-lg bg-superficie-2 p-4">
              <p id="titulo-confirmacao" className="font-semibold text-tinta">
                {confirmando === 'aprovado' ? `Aprovar ${nomeAtleta}?` : `Não aprovar ${nomeAtleta}?`}
              </p>
              <p id="texto-confirmacao" className="mt-1 text-sm text-tinta-suave">
                {confirmando === 'aprovado'
                  ? 'O atleta passa a fazer parte da academia e ganha acesso ao check-in e à evolução.'
                  : 'O atleta verá o resultado e a sua observação na área de inscrições.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Botao variante={confirmando === 'aprovado' ? 'marca' : 'perigo'} onClick={() => aoConcluir(notas, observacao, confirmando)} autoFocus>
                  Confirmar
                </Botao>
                <Botao variante="contorno" onClick={() => setConfirmando(null)}>Voltar</Botao>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-2">
              <Botao variante="marca" onClick={() => setConfirmando('aprovado')}>Aprovar para a academia</Botao>
              <Botao variante="perigo" onClick={() => setConfirmando('reprovado')}>Não aprovar</Botao>
              <Botao variante="fantasma" onClick={aoCancelar}>Cancelar</Botao>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
