import { useState } from 'react';
import { Bus, Car, ChevronRight, Map, Navigation, Route } from 'lucide-react';
import type { Peneira } from '../../tipos';
import { opcoesDeRota, type OpcaoRota } from '../../lib/mobilidade';
import { Botao } from '../ui/Botao';
import { Dialogo } from '../ui/Dialogo';

const ICONES: Record<OpcaoRota['id'], typeof Car> = { uber: Car, moovit: Bus, waze: Navigation, maps: Map };

/**
 * Um botão "Como chegar" que abre a escolha do app (Uber, Moovit, Waze ou Google Maps).
 * O app escolhido abre com o destino já marcado; nenhum preço é mostrado aqui.
 */
export function ComoChegar({ peneira, variante = 'marca', compacto = false }: { peneira: Peneira; variante?: 'marca' | 'contorno' | 'claro' | 'fantasma'; compacto?: boolean }) {
  const [aberto, setAberto] = useState(false);
  const opcoes = opcoesDeRota(peneira);

  return (
    <div className={compacto ? 'inline-flex' : 'flex flex-wrap items-center justify-between gap-3'}>
      {!compacto && (
        <p className="min-w-0 text-sm text-tinta-suave">
          <span className="block font-semibold text-tinta">{peneira.local}</span>
          {peneira.endereco}, {peneira.cidade} ({peneira.uf})
        </p>
      )}
      <Botao variante={variante} tamanho={compacto ? 'sm' : 'md'} onClick={() => setAberto(true)} aria-haspopup="dialog" aria-label={compacto ? `Como chegar: ${peneira.local}` : undefined}>
        <Route aria-hidden="true" className="size-5" />
        Como chegar
      </Botao>

      <Dialogo aberto={aberto} aoFechar={() => setAberto(false)} titulo="Como chegar">
        <p className="text-tinta">
          Escolha o app. Ele abre com o destino <strong className="font-semibold">{peneira.local}</strong> já marcado.
        </p>
        <p className="mt-1 text-sm text-tinta-suave">{peneira.endereco}, {peneira.cidade} ({peneira.uf})</p>
        <ul className="mt-4 divide-y divide-linha">
          {opcoes.map((o) => {
            const Icone = ICONES[o.id];
            return (
              <li key={o.id}>
                <a
                  href={o.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setAberto(false)}
                  className="flex min-h-16 items-center gap-4 rounded-lg px-2 py-3 hover:bg-superficie-2"
                >
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-realce-suave text-realce">
                    <Icone aria-hidden="true" className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-tinta">Abrir no {o.nome}</span>
                    <span className="block text-sm text-tinta-suave">{o.descricao}</span>
                  </span>
                  <ChevronRight aria-hidden="true" className="size-5 text-tinta-suave" />
                  <span className="sr-only">(abre em nova aba)</span>
                </a>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm text-tinta-suave">Chegue 30 minutos antes, com documento com foto e chuteira.</p>
      </Dialogo>
    </div>
  );
}
