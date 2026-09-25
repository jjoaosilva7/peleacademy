import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { LogOut, type LucideIcon } from 'lucide-react';
import { useEstado } from '../../estado/EstadoApp';
import { primeiroNome } from '../../lib/texto';
import { FotoJogador } from '../dominio/FotoJogador';
import { Avatar } from '../ui/Avatar';
import { Marca } from './Marca';

export interface ItemNavegacao {
  para: string;
  rotulo: string;
  icone: LucideIcon;
  fim?: boolean;
  /** Fica fora da barra inferior do celular (aparece só na lateral) */
  soNaLateral?: boolean;
}

function pularParaConteudo(evento: React.MouseEvent<HTMLAnchorElement>) {
  evento.preventDefault();
  document.getElementById('conteudo')?.focus();
}

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function Layout({ itens, subtitulo }: { itens: ItemNavegacao[]; subtitulo: string }) {
  const { usuario, atletaLogado, sair } = useEstado();
  const { pathname } = useLocation();
  const itensCelular = itens.filter((i) => !i.soNaLateral);
  const nome = atletaLogado?.apelido || (usuario ? primeiroNome(usuario.nome) : '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const foto = usuario && (atletaLogado ? <FotoJogador atleta={atletaLogado} tamanho="sm" redonda /> : <Avatar nome={usuario.nome} tamanho="sm" />);

  return (
    <div className="min-h-full bg-papel">
      <a
        href="#conteudo"
        onClick={pularParaConteudo}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-tinta focus:px-4 focus:py-2 focus:font-semibold focus:text-papel"
      >
        Pular para o conteúdo
      </a>

      {/* Topo no celular: saudação com foto, como um cartão flutuante */}
      <header className="sticky z-30 px-3 pt-3 md:hidden" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center gap-3 rounded-full bg-superficie/95 p-1.5 pr-2 shadow-folha backdrop-blur">
          {foto}
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate font-semibold text-tinta">{nome}</p>
            <p className="truncate text-xs text-tinta-suave">{saudacao()}, {subtitulo.toLowerCase()}</p>
          </div>
          <button
            type="button"
            onClick={sair}
            aria-label="Sair da conta"
            className="inline-flex size-11 items-center justify-center rounded-full bg-superficie-2 text-tinta hover:bg-linha"
          >
            <LogOut aria-hidden="true" className="size-5" />
          </button>
        </div>
      </header>

      {/* Barra superior no tablet e no computador: logo, links e o usuário, como num site esportivo */}
      <header className="sticky top-0 z-30 hidden px-4 pt-4 md:block">
        <div className="mx-auto flex max-w-6xl items-center gap-4 rounded-full bg-superficie/95 py-2 pl-3 pr-2 shadow-folha backdrop-blur">
          <Marca />
          <nav aria-label="Principal" className="flex-1">
            <ul className="flex flex-wrap items-center justify-center gap-1">
              {itens.map(({ para, rotulo, fim }) => (
                <li key={para}>
                  <NavLink
                    to={para}
                    end={fim}
                    className={({ isActive }) =>
                      'relative inline-flex min-h-11 items-center rounded-full px-4 text-xs font-bold uppercase tracking-[0.12em] transition-colors ' +
                      (isActive ? 'bg-marca text-sobre-marca' : 'text-tinta hover:bg-superficie-2')
                    }
                  >
                    {rotulo}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          {usuario && (
            <div className="flex items-center gap-2 rounded-full bg-superficie-2 p-1 pl-1">
              {foto}
              <div className="hidden min-w-0 leading-tight lg:block">
                <p className="truncate text-sm font-semibold text-tinta">{nome}</p>
                <p className="truncate text-xs text-tinta-suave">{subtitulo}</p>
              </div>
              <button
                type="button"
                onClick={sair}
                aria-label="Sair da conta"
                className="inline-flex size-10 items-center justify-center rounded-full bg-superficie text-tinta hover:bg-linha"
              >
                <LogOut aria-hidden="true" className="size-4.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main id="conteudo" tabIndex={-1} className="min-w-0 pb-32 md:pb-16">
        <Outlet />
      </main>

      {/* Barra de navegação flutuante no celular: pílula escura só com ícones */}
      <nav
        aria-label="Principal"
        className="fixed left-1/2 z-30 -translate-x-1/2 md:hidden"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        <ul className="flex gap-1 rounded-full bg-cromo p-1.5 shadow-2xl">
          {itensCelular.map(({ para, rotulo, icone: Icone, fim }) => (
            <li key={para}>
              <NavLink
                to={para}
                end={fim}
                title={rotulo}
                className={({ isActive }) =>
                  'flex size-12 items-center justify-center rounded-full transition-colors ' +
                  (isActive ? 'bg-marca text-sobre-marca' : 'text-white/75 hover:text-white')
                }
              >
                <Icone aria-hidden="true" className="size-5" />
                <span className="sr-only">{rotulo}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
