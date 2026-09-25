import { MapPinOff } from 'lucide-react';
import { useEstado } from '../estado/EstadoApp';
import { useTitulo } from '../lib/useTitulo';
import { LinkBotao } from '../componentes/ui/Botao';
import { Vazio } from '../componentes/ui/Vazio';

export function NaoEncontrada() {
  useTitulo('Página não encontrada');
  const { usuario } = useEstado();
  const inicio = !usuario ? '/entrar' : usuario.tipo === 'equipe' ? '/equipe' : '/atleta';
  return (
    <main id="conteudo" className="mx-auto max-w-lg px-4 py-16">
      <h1 className="sr-only">Página não encontrada</h1>
      <Vazio
        icone={MapPinOff}
        titulo="Página não encontrada"
        texto="O endereço pode estar errado ou a página mudou de lugar."
        acao={<LinkBotao to={inicio} variante="marca">Voltar ao início</LinkBotao>}
      />
    </main>
  );
}
