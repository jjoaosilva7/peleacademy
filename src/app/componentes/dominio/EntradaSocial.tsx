import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, UserPlus } from 'lucide-react';
import type { Usuario } from '../../tipos';
import { useEstado } from '../../estado/EstadoApp';
import { CONTAS_DEMONSTRACAO } from '../../dados/exemplo';
import { ErroSocial, MENSAGEM_ERRO, NOME_PROVEDOR, entrarComProvedorReal, provedorConfigurado, type Provedor } from '../../lib/autenticacaoSocial';
import { iniciais, primeiroNome } from '../../lib/texto';
import { Botao } from '../ui/Botao';
import { Dialogo } from '../ui/Dialogo';
import { useAviso } from '../ui/Aviso';

/** Botões "Continuar com Google" e "Continuar com Apple", com a escolha de conta. */
export function EntradaSocial({ tipo, aoErro, compacto = false }: { tipo: Usuario['tipo']; aoErro: (mensagem: string) => void; compacto?: boolean }) {
  const { db, entrarComProvedor } = useEstado();
  const avisar = useAviso();
  const navegar = useNavigate();
  const [provedor, setProvedor] = useState<Provedor | null>(null);
  const [carregando, setCarregando] = useState<Provedor | null>(null);
  const contas = CONTAS_DEMONSTRACAO.filter((c) => c.tipo === tipo);

  /** Com a chave configurada, abre a janela real do provedor; sem ela, a escolha de conta de demonstração. */
  async function iniciar(p: Provedor) {
    if (!provedorConfigurado(p)) {
      setProvedor(p);
      return;
    }
    setCarregando(p);
    try {
      const identidade = await entrarComProvedorReal(p);
      const resultado = entrarComProvedor(identidade.email, tipo);
      if (resultado.ok) {
        avisar(`Você entrou com ${NOME_PROVEDOR[p]}.`, 'sucesso');
        navegar(tipo === 'equipe' ? '/equipe' : '/atleta');
      } else if (tipo === 'atleta' && !db.usuarios.some((u) => u.email.toLowerCase() === identidade.email.toLowerCase())) {
        avisar(`Bem-vindo. Complete seu cadastro para entrar com ${NOME_PROVEDOR[p]}.`, 'info');
        navegar('/cadastro', { state: { identidade } });
      } else {
        aoErro(resultado.mensagem);
      }
    } catch (e) {
      aoErro(e instanceof ErroSocial ? MENSAGEM_ERRO[e.motivo] : MENSAGEM_ERRO.falha);
    } finally {
      setCarregando(null);
    }
  }

  function escolher(email: string) {
    const resultado = entrarComProvedor(email, tipo);
    const nome = provedor ? NOME_PROVEDOR[provedor] : '';
    setProvedor(null);
    if (!resultado.ok) {
      aoErro(resultado.mensagem);
      return;
    }
    const conta = db.usuarios.find((u) => u.email === email);
    avisar(`Você entrou com ${nome}. Olá, ${conta ? primeiroNome(conta.nome) : ''}.`, 'sucesso');
    navegar(tipo === 'equipe' ? '/equipe' : '/atleta');
  }

  return (
    <>
      <div className={compacto ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2.5'}>
        <Botao variante="contorno" className="w-full" onClick={() => iniciar('google')} disabled={carregando !== null} aria-busy={carregando === 'google'} aria-haspopup={provedorConfigurado('google') ? undefined : 'dialog'}>
          {carregando === 'google' ? 'Abrindo Google…' : compacto ? 'Google' : 'Continuar com Google'}
        </Botao>
        <Botao variante={compacto ? 'contorno' : 'escuro'} className="w-full" onClick={() => iniciar('apple')} disabled={carregando !== null} aria-busy={carregando === 'apple'} aria-haspopup={provedorConfigurado('apple') ? undefined : 'dialog'}>
          {carregando === 'apple' ? 'Abrindo Apple…' : compacto ? 'Apple' : 'Continuar com Apple'}
        </Botao>
      </div>

      <Dialogo aberto={provedor !== null} aoFechar={() => setProvedor(null)} titulo={provedor ? `Entrar com ${NOME_PROVEDOR[provedor]}` : ''}>
        <p className="text-tinta">Escolha uma conta para continuar na Pelé Academia.</p>
        <ul className="mt-4 divide-y divide-linha">
          {contas.map((c) => {
            const conta = db.usuarios.find((u) => u.email === c.email);
            return (
              <li key={c.email}>
                <button type="button" onClick={() => escolher(c.email)} className="flex min-h-16 w-full items-center gap-3 rounded-lg px-2 py-3 text-left hover:bg-superficie-2">
                  <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-marca font-display font-bold text-sobre-marca">
                    {iniciais(conta?.nome ?? c.email)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-tinta">{conta?.nome ?? c.rotulo}</span>
                    <span className="block truncate text-sm text-tinta-suave">{c.email}</span>
                  </span>
                  <ChevronRight aria-hidden="true" className="size-5 text-tinta-suave" />
                </button>
              </li>
            );
          })}
          {tipo === 'atleta' && (
            <li>
              <button type="button" onClick={() => { setProvedor(null); navegar('/cadastro'); }} className="flex min-h-16 w-full items-center gap-3 rounded-lg px-2 py-3 text-left hover:bg-superficie-2">
                <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-superficie-2 text-tinta">
                  <UserPlus className="size-5" />
                </span>
                <span className="flex-1 font-semibold text-tinta">Usar outra conta e criar cadastro</span>
              </button>
            </li>
          )}
        </ul>
        <p className="mt-4 rounded-lg bg-superficie-2 p-3 text-sm text-tinta-suave">
          Modo de demonstração: a janela oficial do {provedor ? NOME_PROVEDOR[provedor] : ''} entra no lugar desta lista quando a chave do provedor estiver configurada no site publicado.
        </p>
      </Dialogo>
    </>
  );
}
