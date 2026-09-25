import type { ReactNode } from 'react';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { HashRouter, MemoryRouter, Navigate, Route, Routes } from 'react-router';
import { Abertura, aberturaDesligada } from './componentes/abertura/Abertura';
import {
  ClipboardCheck, ClipboardList, House, LayoutDashboard, Search, Shirt, Timer, TrendingUp, Trophy, UserRound, UsersRound,
} from 'lucide-react';
import { ProvedorEstado, useEstado } from './estado/EstadoApp';
import { categoriaDoAtleta } from './lib/regras';
import { ProvedorAvisos } from './componentes/ui/Aviso';
import { Layout, type ItemNavegacao } from './componentes/layout/Layout';
import { Entrar } from './paginas/auth/Entrar';
import { Cadastro } from './paginas/auth/Cadastro';

// As áreas do atleta e da equipe carregam sob demanda (code splitting): a tela de entrar fica leve.
const Inicio = lazy(() => import('./paginas/atleta/Inicio').then((m) => ({ default: m.Inicio })));
const Peneiras = lazy(() => import('./paginas/atleta/Peneiras').then((m) => ({ default: m.Peneiras })));
const CheckIn = lazy(() => import('./paginas/atleta/CheckIn').then((m) => ({ default: m.CheckIn })));
const Evolucao = lazy(() => import('./paginas/atleta/Evolucao').then((m) => ({ default: m.Evolucao })));
const Talentos = lazy(() => import('./paginas/atleta/Talentos').then((m) => ({ default: m.Talentos })));
const PerfilTalento = lazy(() => import('./paginas/atleta/PerfilTalento').then((m) => ({ default: m.PerfilTalento })));
const MeuPerfil = lazy(() => import('./paginas/atleta/MeuPerfil').then((m) => ({ default: m.MeuPerfil })));
const Painel = lazy(() => import('./paginas/equipe/Painel').then((m) => ({ default: m.Painel })));
const PeneirasEquipe = lazy(() => import('./paginas/equipe/PeneirasEquipe').then((m) => ({ default: m.PeneirasEquipe })));
const PeneiraDetalhe = lazy(() => import('./paginas/equipe/PeneiraDetalhe').then((m) => ({ default: m.PeneiraDetalhe })));
const AvaliarCandidato = lazy(() => import('./paginas/equipe/AvaliarCandidato').then((m) => ({ default: m.AvaliarCandidato })));
const Atletas = lazy(() => import('./paginas/equipe/Atletas').then((m) => ({ default: m.Atletas })));
const FichaAtleta = lazy(() => import('./paginas/equipe/FichaAtleta').then((m) => ({ default: m.FichaAtleta })));
const RegistrarAvaliacao = lazy(() => import('./paginas/equipe/RegistrarAvaliacao').then((m) => ({ default: m.RegistrarAvaliacao })));
const Treino = lazy(() => import('./paginas/equipe/Treino').then((m) => ({ default: m.Treino })));
const Times = lazy(() => import('./paginas/equipe/Times').then((m) => ({ default: m.Times })));
const Jogos = lazy(() => import('./paginas/equipe/Jogos').then((m) => ({ default: m.Jogos })));
const RegistrarJogo = lazy(() => import('./paginas/equipe/RegistrarJogo').then((m) => ({ default: m.RegistrarJogo })));
import { NaoEncontrada } from './paginas/NaoEncontrada';

const NAV_CANDIDATO: ItemNavegacao[] = [
  { para: '/atleta', rotulo: 'Início', icone: House, fim: true },
  { para: '/atleta/peneiras', rotulo: 'Peneiras', icone: Search },
  { para: '/atleta/talentos', rotulo: 'Talentos', icone: UsersRound },
  { para: '/atleta/perfil', rotulo: 'Perfil', icone: UserRound },
];

const NAV_ACADEMIA: ItemNavegacao[] = [
  { para: '/atleta', rotulo: 'Início', icone: House, fim: true },
  { para: '/atleta/check-in', rotulo: 'Check-in', icone: ClipboardCheck },
  { para: '/atleta/evolucao', rotulo: 'Evolução', icone: TrendingUp },
  { para: '/atleta/talentos', rotulo: 'Talentos', icone: UsersRound },
  { para: '/atleta/perfil', rotulo: 'Perfil', icone: UserRound },
];

const NAV_EQUIPE: ItemNavegacao[] = [
  { para: '/equipe', rotulo: 'Painel', icone: LayoutDashboard, fim: true },
  { para: '/equipe/treino', rotulo: 'Treino', icone: Timer },
  { para: '/equipe/times', rotulo: 'Times', icone: Shirt },
  { para: '/equipe/jogos', rotulo: 'Jogos', icone: Trophy },
  { para: '/equipe/atletas', rotulo: 'Atletas', icone: UsersRound },
  { para: '/equipe/peneiras', rotulo: 'Peneiras', icone: ClipboardList, soNaLateral: true },
];

function Carregando() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8 text-tinta-suave" role="status" aria-live="polite">
      Carregando…
    </div>
  );
}

function Inicial() {
  const { usuario } = useEstado();
  if (!usuario) return <Navigate to="/entrar" replace />;
  return <Navigate to={usuario.tipo === 'equipe' ? '/equipe' : '/atleta'} replace />;
}

/** Só deixa entrar quem tem o tipo de acesso certo; os demais voltam para a própria área. */
function AreaProtegida({ tipo, children }: { tipo: 'atleta' | 'equipe'; children: ReactNode }) {
  const { usuario } = useEstado();
  if (!usuario) return <Navigate to="/entrar" replace />;
  if (usuario.tipo !== tipo) return <Navigate to={usuario.tipo === 'equipe' ? '/equipe' : '/atleta'} replace />;
  return <>{children}</>;
}

function LayoutAtleta() {
  const { atletaLogado, hoje } = useEstado();
  if (!atletaLogado) return <Navigate to="/entrar" replace />;
  const academia = atletaLogado.status === 'academia';
  const subtitulo = academia ? `Atleta, ${categoriaDoAtleta(atletaLogado, hoje)}` : `Candidato, ${categoriaDoAtleta(atletaLogado, hoje)}`;
  return <Layout itens={academia ? NAV_ACADEMIA : NAV_CANDIDATO} subtitulo={subtitulo} />;
}

function LayoutEquipe() {
  const { usuario } = useEstado();
  return <Layout itens={NAV_EQUIPE} subtitulo={usuario?.cargo ?? 'Equipe'} />;
}

export default function App() {
  const [abertura, setAbertura] = useState(() => !aberturaDesligada());
  const app = useRef<HTMLDivElement>(null);

  // Enquanto a abertura está na tela, o app por trás não recebe foco nem cliques.
  useEffect(() => {
    if (app.current) app.current.inert = abertura;
  }, [abertura]);

  return (
    <ProvedorEstado>
      <ProvedorAvisos>
        {abertura && <Abertura aoTerminar={() => setAbertura(false)} />}
        <div ref={app} className="contents">
        <Roteador>
          <Suspense fallback={<Carregando />}>
          <Routes>
            <Route path="/" element={<Inicial />} />
            <Route path="/entrar" element={<Entrar />} />
            <Route path="/cadastro" element={<Cadastro />} />

            <Route path="/atleta" element={<AreaProtegida tipo="atleta"><LayoutAtleta /></AreaProtegida>}>
              <Route index element={<Inicio />} />
              <Route path="peneiras" element={<Peneiras />} />
              <Route path="check-in" element={<CheckIn />} />
              <Route path="evolucao" element={<Evolucao />} />
              <Route path="talentos" element={<Talentos />} />
              <Route path="talentos/:id" element={<PerfilTalento />} />
              <Route path="perfil" element={<MeuPerfil />} />
            </Route>

            <Route path="/equipe" element={<AreaProtegida tipo="equipe"><LayoutEquipe /></AreaProtegida>}>
              <Route index element={<Painel />} />
              <Route path="treino" element={<Treino />} />
              <Route path="times" element={<Times />} />
              <Route path="jogos" element={<Jogos />} />
              <Route path="jogos/novo" element={<RegistrarJogo />} />
              <Route path="peneiras" element={<PeneirasEquipe />} />
              <Route path="peneiras/:id" element={<PeneiraDetalhe />} />
              <Route path="avaliar/:inscricaoId" element={<AvaliarCandidato />} />
              <Route path="atletas" element={<Atletas />} />
              <Route path="atletas/:id" element={<FichaAtleta />} />
              <Route path="atletas/:id/avaliar" element={<RegistrarAvaliacao />} />
            </Route>

            <Route path="*" element={<NaoEncontrada />} />
          </Routes>
          </Suspense>
        </Roteador>
        </div>
      </ProvedorAvisos>
    </ProvedorEstado>
  );
}

/**
 * O HashRouter precisa de um endereço de verdade (http, https ou arquivo).
 * Quando o app roda dentro de uma prévia sem endereço (about:srcdoc ou blob),
 * o navegador não consegue montar os links e dá "Failed to construct 'URL'".
 * Nesses casos usamos o MemoryRouter, que guarda a navegação só na memória.
 */
function Roteador({ children }: { children: ReactNode }) {
  const temEndereco = ['http:', 'https:', 'file:'].includes(window.location.protocol);
  return temEndereco ? <HashRouter>{children}</HashRouter> : <MemoryRouter>{children}</MemoryRouter>;
}
