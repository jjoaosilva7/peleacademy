import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useEstado } from '../../estado/EstadoApp';
import {
  calcularIdade, categoriaPorIdade, NACIONALIDADES, PES, POSICOES, precisaDeResponsavel, UFS, validarCadastro,
  type DadosCadastro, type ErrosCadastro,
} from '../../lib/regras';
import { useTitulo } from '../../lib/useTitulo';
import { NOME_PROVEDOR, type IdentidadeSocial } from '../../lib/autenticacaoSocial';
import { Botao } from '../../componentes/ui/Botao';
import { CampoSelecao, CampoTexto, MensagemErro } from '../../componentes/ui/Campo';
import { Escolha } from '../../componentes/ui/Escolha';
import { useAviso } from '../../componentes/ui/Aviso';
import { Marca } from '../../componentes/layout/Marca';

const VAZIO: DadosCadastro = {
  nome: '', apelido: '', nacionalidade: 'Brasil', nascimento: '', cidade: '', uf: '', posicao: '', pe: '', altura: '', peso: '',
  responsavelNome: '', responsavelEmail: '', responsavelTelefone: '', consentimento: false,
  email: '', senha: '', confirmarSenha: '',
};

/** Ordem de foco quando há erros: o primeiro campo inválido recebe o foco. */
const ORDEM: (keyof DadosCadastro)[] = [
  'nome', 'apelido', 'nascimento', 'cidade', 'uf', 'posicao', 'pe', 'altura', 'peso',
  'responsavelNome', 'responsavelEmail', 'responsavelTelefone', 'consentimento', 'email', 'senha', 'confirmarSenha',
];

function Grupo({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-xl bg-superficie p-5 shadow-folha md:p-6">
      <legend className="float-left mb-4 w-full">
        <span className="block font-display text-2xl font-bold text-tinta">{titulo}</span>
        {descricao && <span className="mt-1 block text-tinta-suave">{descricao}</span>}
      </legend>
      <div className="clear-both grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function Cadastro() {
  useTitulo('Criar conta');
  const { db, hoje, usuario, cadastrarAtleta } = useEstado();
  const avisar = useAviso();
  const navegar = useNavigate();
  const { state } = useLocation() as { state?: { identidade?: IdentidadeSocial } };
  const identidade = state?.identidade ?? null;
  const [dados, setDados] = useState<DadosCadastro>(() => {
    if (!identidade) return VAZIO;
    // Conta ligada ao Google ou à Apple: e-mail e nome vêm do provedor e a senha é gerada
    const senha = `${Math.random().toString(36).slice(2, 10)}A1`;
    return { ...VAZIO, nome: identidade.nome ?? '', email: identidade.email, senha, confirmarSenha: senha };
  });
  const [erros, setErros] = useState<ErrosCadastro>({});
  const [tentou, setTentou] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  const emails = db.usuarios.map((u) => u.email.toLowerCase());
  const dataValida = /^\d{4}-\d{2}-\d{2}$/.test(dados.nascimento) && dados.nascimento <= hoje;
  const idade = dataValida ? calcularIdade(dados.nascimento, hoje) : null;
  const categoria = idade !== null ? categoriaPorIdade(idade) : null;
  const menor = precisaDeResponsavel(dados.nascimento, hoje);
  const totalErros = Object.keys(erros).length;

  function mudar<K extends keyof DadosCadastro>(campo: K, valor: DadosCadastro[K]) {
    const novo = { ...dados, [campo]: valor };
    setDados(novo);
    if (tentou) setErros(validarCadastro(novo, emails, hoje));
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    setTentou(true);
    const encontrados = validarCadastro(dados, emails, hoje);
    setErros(encontrados);
    const primeiro = ORDEM.find((campo) => encontrados[campo]);
    if (primeiro) {
      const alvo = primeiro === 'pe' ? document.querySelector<HTMLInputElement>('input[name="pe"]') : document.getElementById(primeiro);
      alvo?.focus();
      return;
    }
    cadastrarAtleta(dados);
    avisar('Conta criada. Agora é só procurar uma peneira da sua categoria.', 'sucesso');
    navegar('/atleta');
  }

  return (
    <div className="min-h-full">
      <header className="p-3"><div className="rounded-full bg-marca-forte">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Marca clara />
          <Link to="/entrar" className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold text-sobre-marca hover:bg-white/10">
            <ArrowLeft aria-hidden="true" className="size-5" />
            Voltar para entrar
          </Link>
        </div>
      </div></header>

      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
        <h1 className="text-4xl text-tinta">Criar conta de atleta</h1>
        <p className="mt-2 text-lg text-tinta-suave">
          Para candidatos de 7 a 20 anos. Jogador de linha começa com 55 de ataque, 45 de defesa, 45 de força e 55 de habilidade; goleiro, com 45 de chute, 55 de elasticidade e 50 de posicionamento. Daí pra frente, quem muda seus números é a nota do treinador.
        </p>

        <form noValidate onSubmit={enviar} className="mt-8 flex flex-col gap-6">
          {totalErros > 0 && (
            <div role="alert" className="rounded-lg border border-erro/40 bg-erro-suave p-4 font-medium text-erro">
              {totalErros === 1 ? 'Há 1 campo para corrigir.' : `Há ${totalErros} campos para corrigir.`} Eles estão destacados abaixo.
            </div>
          )}

          <Grupo titulo="Sobre você">
            <CampoTexto id="nome" rotulo="Nome completo" autoComplete="name" value={dados.nome} onChange={(e) => mudar('nome', e.target.value)} erro={erros.nome} className="sm:col-span-2" />
            <CampoTexto id="apelido" rotulo="Apelido no campo" opcional maxLength={16} value={dados.apelido} onChange={(e) => mudar('apelido', e.target.value)} erro={erros.apelido} dica="Aparece no seu cartão e nas escalações." />
            <CampoSelecao id="nacionalidade" rotulo="País" value={dados.nacionalidade} onChange={(e) => mudar('nacionalidade', e.target.value)}>
              {NACIONALIDADES.map((n) => <option key={n} value={n}>{n}</option>)}
            </CampoSelecao>
            <CampoTexto
              id="nascimento"
              rotulo="Data de nascimento"
              type="date"
              max={hoje}
              value={dados.nascimento}
              onChange={(e) => mudar('nascimento', e.target.value)}
              erro={erros.nascimento}
              dica={categoria ? `${idade} anos, categoria ${categoria}.` : 'A categoria é definida pela sua idade.'}
            />
            <div className="hidden sm:block" aria-hidden="true" />
            <CampoTexto id="cidade" rotulo="Cidade" autoComplete="address-level2" value={dados.cidade} onChange={(e) => mudar('cidade', e.target.value)} erro={erros.cidade} />
            <CampoSelecao id="uf" rotulo="Estado" value={dados.uf} onChange={(e) => mudar('uf', e.target.value)} erro={erros.uf}>
              <option value="">Selecione</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </CampoSelecao>
          </Grupo>

          <Grupo titulo="No campo">
            <CampoSelecao id="posicao" rotulo="Posição principal" value={dados.posicao} onChange={(e) => mudar('posicao', e.target.value)} erro={erros.posicao}>
              <option value="">Selecione</option>
              {POSICOES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </CampoSelecao>
            <Escolha
              nome="pe"
              legenda="Pé dominante"
              valor={dados.pe || null}
              aoMudar={(v) => mudar('pe', v)}
              opcoes={PES.map((p) => ({ valor: p, rotulo: p }))}
              erro={erros.pe}
            />
            <CampoTexto id="altura" rotulo="Altura (cm)" type="number" inputMode="numeric" min={100} max={220} opcional value={dados.altura} onChange={(e) => mudar('altura', e.target.value)} erro={erros.altura} />
            <CampoTexto id="peso" rotulo="Peso (kg)" type="number" inputMode="numeric" min={20} max={150} opcional value={dados.peso} onChange={(e) => mudar('peso', e.target.value)} erro={erros.peso} />
          </Grupo>

          {menor && (
            <Grupo titulo="Responsável" descricao="Como você tem menos de 18 anos, precisamos dos dados e da autorização de um responsável.">
              <CampoTexto id="responsavelNome" rotulo="Nome do responsável" value={dados.responsavelNome} onChange={(e) => mudar('responsavelNome', e.target.value)} erro={erros.responsavelNome} className="sm:col-span-2" />
              <CampoTexto id="responsavelEmail" rotulo="E-mail do responsável" type="email" inputMode="email" value={dados.responsavelEmail} onChange={(e) => mudar('responsavelEmail', e.target.value)} erro={erros.responsavelEmail} />
              <CampoTexto id="responsavelTelefone" rotulo="Telefone com DDD" type="tel" inputMode="tel" autoComplete="tel" value={dados.responsavelTelefone} onChange={(e) => mudar('responsavelTelefone', e.target.value)} erro={erros.responsavelTelefone} dica="Exemplo: 24 99999 0000" />
              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    id="consentimento"
                    type="checkbox"
                    checked={dados.consentimento}
                    onChange={(e) => mudar('consentimento', e.target.checked)}
                    aria-invalid={erros.consentimento ? true : undefined}
                    aria-describedby={erros.consentimento ? 'consentimento-erro' : undefined}
                    className="mt-1 size-5 shrink-0 accent-marca"
                  />
                  <span className="text-tinta">
                    Sou o responsável e autorizo o cadastro do atleta e o uso dos dados dele pela Pelé Academia, conforme a LGPD.
                  </span>
                </label>
                {erros.consentimento && <MensagemErro id="consentimento-erro">{erros.consentimento}</MensagemErro>}
              </div>
            </Grupo>
          )}

          <Grupo titulo="Acesso">
            {identidade ? (
              <p className="text-tinta sm:col-span-2">
                Conta ligada ao {NOME_PROVEDOR[identidade.provedor]}: <strong className="font-semibold">{identidade.email}</strong>. Você entra sem senha, pelo botão do {NOME_PROVEDOR[identidade.provedor]}.
              </p>
            ) : (
              <>
                <CampoTexto id="email" rotulo="E-mail" type="email" inputMode="email" autoComplete="email" value={dados.email} onChange={(e) => mudar('email', e.target.value)} erro={erros.email} className="sm:col-span-2" />
                <CampoTexto id="senha" rotulo="Senha" type="password" autoComplete="new-password" value={dados.senha} onChange={(e) => mudar('senha', e.target.value)} erro={erros.senha} dica="Pelo menos 8 caracteres, com letras e números." />
                <CampoTexto id="confirmarSenha" rotulo="Repita a senha" type="password" autoComplete="new-password" value={dados.confirmarSenha} onChange={(e) => mudar('confirmarSenha', e.target.value)} erro={erros.confirmarSenha} />
              </>
            )}
          </Grupo>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link to="/entrar" className="inline-flex min-h-11 items-center justify-center rounded-full px-5 font-semibold text-realce hover:bg-realce-suave">
              Cancelar
            </Link>
            <Botao type="submit" variante="marca">Criar conta</Botao>
          </div>
        </form>
      </main>
    </div>
  );
}
