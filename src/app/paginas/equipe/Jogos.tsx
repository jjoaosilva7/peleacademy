import { Link } from 'react-router';
import { CalendarPlus, Trophy } from 'lucide-react';
import { useEstado } from '../../estado/EstadoApp';
import type { Jogo } from '../../tipos';
import { dataLonga } from '../../lib/datas';
import { useTitulo } from '../../lib/useTitulo';
import { LinkBotao } from '../../componentes/ui/Botao';
import { Pagina, Secao } from '../../componentes/ui/Cartao';
import { Etiqueta } from '../../componentes/ui/Etiqueta';
import { Vazio } from '../../componentes/ui/Vazio';

function resultado(j: Jogo) {
  if (j.golsPro > j.golsContra) return { texto: 'Vitória', tom: 'sucesso' as const };
  if (j.golsPro < j.golsContra) return { texto: 'Derrota', tom: 'erro' as const };
  return { texto: 'Empate', tom: 'neutro' as const };
}

export function Jogos() {
  useTitulo('Jogos');
  const { db } = useEstado();
  const jogos = [...db.jogos].sort((a, b) => b.data.localeCompare(a.data));
  const porId = new Map(db.atletas.map((a) => [a.id, a]));

  return (
    <Pagina
      titulo="Jogos"
      descricao="Depois de cada jogo, lance gols, assistências e desarmes. Os números vão para o perfil de cada atleta."
      acao={<LinkBotao to="/equipe/jogos/novo" variante="primario"><CalendarPlus aria-hidden="true" className="size-5" />Registrar jogo</LinkBotao>}
    >
      <Secao>
        {jogos.length === 0 ? (
          <Vazio icone={Trophy} titulo="Nenhum jogo registrado" texto="Registre o primeiro jogo para montar as estatísticas da temporada." />
        ) : (
          <ul className="divide-y divide-linha">
            {jogos.map((j) => {
              const r = resultado(j);
              const autores = j.estatisticas.filter((e) => e.gols > 0).map((e) => `${porId.get(e.atletaId)?.apelido || porId.get(e.atletaId)?.nome.split(' ')[0]}${e.gols > 1 ? ` (${e.gols})` : ''}`);
              return (
                <li key={j.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="num flex w-28 shrink-0 items-center justify-center gap-2 rounded-2xl bg-superficie-2 py-2 text-2xl font-semibold text-tinta" aria-label={`Placar ${j.golsPro} a ${j.golsContra}`}>
                    <span>{j.golsPro}</span><span aria-hidden="true" className="text-base text-tinta-suave">x</span><span>{j.golsContra}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xl font-bold text-tinta">{j.adversario}</p>
                    <p className="text-sm text-tinta-suave">
                      {dataLonga(j.data)}, {j.mando === 'casa' ? 'em casa' : 'fora'}. {autores.length ? `Gols: ${autores.join(', ')}.` : 'Sem gols da academia.'}
                    </p>
                  </div>
                  <Etiqueta tom={r.tom}>{r.texto}</Etiqueta>
                </li>
              );
            })}
          </ul>
        )}
      </Secao>
      <p className="text-tinta-suave">
        As estatísticas também aparecem na <Link to="/equipe/atletas" className="font-semibold text-realce underline underline-offset-4 hover:no-underline">ficha de cada atleta</Link>.
      </p>
    </Pagina>
  );
}
