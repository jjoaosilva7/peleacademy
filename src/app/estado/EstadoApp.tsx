/*
 * Estado global do MVP: sessão, dados e todas as ações do app.
 * Sem servidor nesta sprint: os dados ficam no navegador (localStorage) e podem ser restaurados.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type {
  Atleta, Avaliacao, BancoDados, Categoria, CheckIn, EstatisticaJogo, Jogo, Nacionalidade, Notas, Posicao, PeDominante,
  Profissional, RegistroTreino, Usuario,
} from '../tipos';
import { VERSAO_DADOS, criarBancoExemplo } from '../dados/exemplo';
import { gravar, ler, remover } from '../lib/armazenamento';
import { hojeISO } from '../lib/datas';
import { precisaDeResponsavel, somenteDigitos, verificarInscricao, type DadosCadastro } from '../lib/regras';

const CHAVE_DADOS = 'pele-academia:dados:v3';
const CHAVE_SESSAO = 'pele-academia:sessao:v1';

type Resultado = { ok: true } | { ok: false; mensagem: string };

interface EstadoApp {
  db: BancoDados;
  hoje: string;
  usuario: Usuario | null;
  atletaLogado: Atleta | null;
  entrar: (email: string, senha: string, tipo: Usuario['tipo']) => Resultado;
  /** Entrada por conta Google ou Apple: a identidade já vem confirmada pelo provedor, sem senha. */
  entrarComProvedor: (email: string, tipo: Usuario['tipo']) => Resultado;
  sair: () => void;
  cadastrarAtleta: (dados: DadosCadastro) => void;
  inscrever: (peneiraId: string) => Resultado;
  registrarCheckin: (checkin: Omit<CheckIn, 'data'>) => void;
  alternarSeguir: (atletaId: string) => boolean;
  alternarVotoTag: (atletaId: string, tagId: string) => boolean;
  avaliarInscricao: (inscricaoId: string, notas: Notas, observacao: string, decisao: 'aprovado' | 'reprovado') => void;
  registrarAvaliacao: (atletaId: string, notas: Notas, observacao: string) => void;
  salvarPerfil: (atletaId: string, dados: { apelido?: string | null; foto?: string | null; nacionalidade?: Nacionalidade }) => void;
  salvarTreino: (categoria: Categoria, registros: RegistroTreino[]) => void;
  registrarJogo: (jogo: Omit<Jogo, 'id'>) => void;
  agendarConsulta: (profissional: Profissional, data: string, horario: string, motivo: string) => void;
  /** A equipe técnica encaminha um atleta para o fisioterapeuta ou o psicólogo em um horário */
  encaminhar: (atletaId: string, profissional: Profissional, data: string, horario: string, motivo: string) => void;
  restaurarExemplo: () => void;
}

const Contexto = createContext<EstadoApp | null>(null);

function gerarId(prefixo: string) {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function proximoNumeroLivre(atletas: Atleta[]): number {
  const usados = new Set(atletas.map((a) => a.numero).filter((n): n is number => n !== null));
  let numero = 2;
  while (usados.has(numero)) numero += 1;
  return numero;
}

export function ProvedorEstado({ children }: { children: ReactNode }) {
  const hoje = hojeISO();
  const [db, setDb] = useState<BancoDados>(() => {
    const salvo = ler<BancoDados>(CHAVE_DADOS);
    // Dados de uma versão antiga do app são descartados para não faltar nada na demonstração
    return salvo && salvo.versao === VERSAO_DADOS ? salvo : criarBancoExemplo(hoje);
  });
  const [sessaoId, setSessaoId] = useState<string | null>(() => ler<string>(CHAVE_SESSAO));

  useEffect(() => gravar(CHAVE_DADOS, db), [db]);
  useEffect(() => {
    if (sessaoId) gravar(CHAVE_SESSAO, sessaoId);
    else remover(CHAVE_SESSAO);
  }, [sessaoId]);

  const usuario = useMemo(() => db.usuarios.find((u) => u.id === sessaoId) ?? null, [db, sessaoId]);
  const atletaLogado = useMemo(
    () => (usuario?.atletaId ? db.atletas.find((a) => a.id === usuario.atletaId) ?? null : null),
    [db, usuario],
  );

  const alterar = useCallback((mudanca: (copia: BancoDados) => void) => {
    setDb((anterior) => {
      const copia = structuredClone(anterior);
      mudanca(copia);
      return copia;
    });
  }, []);

  const entrar: EstadoApp['entrar'] = (email, senha, tipo) => {
    const conta = db.usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!conta || conta.senha !== senha) return { ok: false, mensagem: 'E-mail ou senha incorretos. Confira e tente de novo.' };
    return abrirSessao(conta, tipo);
  };

  const entrarComProvedor: EstadoApp['entrarComProvedor'] = (email, tipo) => {
    const conta = db.usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!conta) return { ok: false, mensagem: 'Não há conta com este e-mail. Crie sua conta de atleta primeiro.' };
    return abrirSessao(conta, tipo);
  };

  const abrirSessao = (conta: Usuario, tipo: Usuario['tipo']): Resultado => {
    if (conta.tipo !== tipo) {
      return {
        ok: false,
        mensagem: conta.tipo === 'equipe'
          ? 'Esta conta é da equipe da academia. Selecione "Equipe" para entrar.'
          : 'Esta conta é de atleta. Selecione "Atleta" para entrar.',
      };
    }
    setSessaoId(conta.id);
    return { ok: true };
  };

  const sair = () => setSessaoId(null);

  const cadastrarAtleta: EstadoApp['cadastrarAtleta'] = (d) => {
    const atletaId = gerarId('a');
    const usuarioId = gerarId('u');
    const menor = precisaDeResponsavel(d.nascimento, hoje);
    alterar((copia) => {
      copia.atletas.push({
        id: atletaId,
        nome: d.nome.trim().replace(/\s+/g, ' '),
        apelido: d.apelido.trim() || null,
        foto: null,
        nacionalidade: (d.nacionalidade || 'Brasil') as Nacionalidade,
        nascimento: d.nascimento,
        posicao: d.posicao as Posicao,
        pe: d.pe as PeDominante,
        cidade: d.cidade.trim(),
        uf: d.uf,
        alturaCm: d.altura ? Number(d.altura) : null,
        pesoKg: d.peso ? Number(d.peso) : null,
        status: 'candidato',
        numero: null,
        desde: null,
        responsavel: menor
          ? { nome: d.responsavelNome.trim(), email: d.responsavelEmail.trim(), telefone: somenteDigitos(d.responsavelTelefone) }
          : null,
        avaliacoes: [],
        checkins: [],
        tags: [],
      });
      copia.usuarios.push({
        id: usuarioId,
        tipo: 'atleta',
        nome: d.nome.trim(),
        email: d.email.trim().toLowerCase(),
        senha: d.senha,
        cargo: null,
        atletaId,
        seguindo: [],
      });
    });
    setSessaoId(usuarioId);
  };

  const inscrever: EstadoApp['inscrever'] = (peneiraId) => {
    const peneira = db.peneiras.find((p) => p.id === peneiraId);
    if (!atletaLogado || !peneira) return { ok: false, mensagem: 'Não foi possível fazer a inscrição.' };
    const verificacao = verificarInscricao(atletaLogado, peneira, db.inscricoes, hoje);
    if (!verificacao.permitido) return { ok: false, mensagem: verificacao.motivo ?? 'Inscrição indisponível.' };
    alterar((copia) => {
      copia.inscricoes.push({
        id: gerarId('i'), peneiraId, atletaId: atletaLogado.id, status: 'inscrito', avaliacaoId: null, dataInscricao: hoje,
      });
    });
    return { ok: true };
  };

  const registrarCheckin: EstadoApp['registrarCheckin'] = (dados) => {
    if (!atletaLogado) return;
    alterar((copia) => {
      const atleta = copia.atletas.find((a) => a.id === atletaLogado.id)!;
      atleta.checkins = atleta.checkins.filter((c) => c.data !== hoje);
      atleta.checkins.push({ ...dados, data: hoje });
    });
  };

  const alternarSeguir: EstadoApp['alternarSeguir'] = (atletaId) => {
    if (!usuario) return false;
    const vaiSeguir = !usuario.seguindo.includes(atletaId);
    alterar((copia) => {
      const u = copia.usuarios.find((x) => x.id === usuario.id)!;
      u.seguindo = vaiSeguir ? [...u.seguindo, atletaId] : u.seguindo.filter((id) => id !== atletaId);
    });
    return vaiSeguir;
  };

  const alternarVotoTag: EstadoApp['alternarVotoTag'] = (atletaId, tagId) => {
    if (!usuario) return false;
    const tag = db.atletas.find((a) => a.id === atletaId)?.tags.find((t) => t.id === tagId);
    if (!tag) return false;
    const vaiVotar = !tag.votos.includes(usuario.id);
    alterar((copia) => {
      const t = copia.atletas.find((a) => a.id === atletaId)!.tags.find((x) => x.id === tagId)!;
      t.votos = vaiVotar ? [...t.votos, usuario.id] : t.votos.filter((id) => id !== usuario.id);
    });
    return vaiVotar;
  };

  const avaliarInscricao: EstadoApp['avaliarInscricao'] = (inscricaoId, notas, observacao, decisao) => {
    if (!usuario) return;
    alterar((copia) => {
      const inscricao = copia.inscricoes.find((i) => i.id === inscricaoId)!;
      const atleta = copia.atletas.find((a) => a.id === inscricao.atletaId)!;
      const peneira = copia.peneiras.find((p) => p.id === inscricao.peneiraId)!;
      const avaliacao: Avaliacao = {
        id: gerarId('av'), data: peneira.data, avaliador: usuario.nome, origem: 'peneira', notas, observacao: observacao.trim(),
      };
      atleta.avaliacoes.push(avaliacao);
      inscricao.status = decisao;
      inscricao.avaliacaoId = avaliacao.id;
      if (decisao === 'aprovado' && atleta.status === 'candidato') {
        atleta.status = 'academia';
        atleta.desde = hoje;
        atleta.numero = proximoNumeroLivre(copia.atletas);
      }
    });
  };

  const registrarAvaliacao: EstadoApp['registrarAvaliacao'] = (atletaId, notas, observacao) => {
    if (!usuario) return;
    alterar((copia) => {
      copia.atletas.find((a) => a.id === atletaId)!.avaliacoes.push({
        id: gerarId('av'), data: hoje, avaliador: usuario.nome, origem: 'academia', notas, observacao: observacao.trim(),
      });
    });
  };

  const salvarPerfil: EstadoApp['salvarPerfil'] = (atletaId, dados) => {
    alterar((copia) => {
      const atleta = copia.atletas.find((a) => a.id === atletaId);
      if (!atleta) return;
      if (dados.apelido !== undefined) atleta.apelido = dados.apelido?.trim() || null;
      if (dados.foto !== undefined) atleta.foto = dados.foto;
      if (dados.nacionalidade) atleta.nacionalidade = dados.nacionalidade;
    });
  };

  const salvarTreino: EstadoApp['salvarTreino'] = (categoria, registros) => {
    if (!usuario) return;
    alterar((copia) => {
      copia.treinos = copia.treinos.filter((t) => !(t.data === hoje && t.categoria === categoria));
      copia.treinos.push({ id: gerarId('t'), data: hoje, categoria, avaliador: usuario.nome, registros });
    });
  };

  const registrarJogo: EstadoApp['registrarJogo'] = (jogo) => {
    const estatisticas: EstatisticaJogo[] = jogo.estatisticas;
    alterar((copia) => {
      copia.jogos.push({ ...jogo, estatisticas, id: gerarId('j') });
    });
  };

  const agendarConsulta: EstadoApp['agendarConsulta'] = (profissional, data, horario, motivo) => {
    if (!atletaLogado) return;
    alterar((copia) => {
      copia.consultas.push({ id: gerarId('c'), atletaId: atletaLogado.id, profissional, data, horario, motivo, origem: 'atleta' });
    });
  };

  const encaminhar: EstadoApp['encaminhar'] = (atletaId, profissional, data, horario, motivo) => {
    alterar((copia) => {
      copia.consultas.push({ id: gerarId('c'), atletaId, profissional, data, horario, motivo, origem: 'equipe' });
    });
  };

  const restaurarExemplo = () => {
    setDb(criarBancoExemplo(hoje));
    setSessaoId(null);
  };

  const valor: EstadoApp = {
    db, hoje, usuario, atletaLogado, entrar, entrarComProvedor, sair, cadastrarAtleta, inscrever, registrarCheckin,
    alternarSeguir, alternarVotoTag, avaliarInscricao, registrarAvaliacao, salvarPerfil, salvarTreino,
    registrarJogo, agendarConsulta, encaminhar, restaurarExemplo,
  };

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEstado(): EstadoApp {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useEstado precisa estar dentro de ProvedorEstado');
  return contexto;
}
