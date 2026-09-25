import { useState } from 'react';
import { Camera } from 'lucide-react';
import type { Atleta } from '../../tipos';
import { useEstado } from '../../estado/EstadoApp';
import { Botao } from '../ui/Botao';
import { Dialogo } from '../ui/Dialogo';
import { useAviso } from '../ui/Aviso';
import { EditorFoto } from './EditorFoto';

/** Botão que abre o editor de foto 3x4 em uma janela. */
export function BotaoFoto({ atleta, variante = 'contorno', rotulo }: { atleta: Atleta; variante?: 'contorno' | 'primario' | 'claro'; rotulo?: string }) {
  const { salvarPerfil } = useEstado();
  const avisar = useAviso();
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <Botao variante={variante} onClick={() => setAberto(true)}>
        <Camera aria-hidden="true" className="size-5" />
        {rotulo ?? (atleta.foto ? 'Trocar foto 3x4' : 'Enviar foto 3x4')}
      </Botao>
      <Dialogo aberto={aberto} aoFechar={() => setAberto(false)} titulo="Foto 3x4">
        {aberto && (
          <EditorFoto
            aoCancelar={() => setAberto(false)}
            aoSalvar={(foto) => {
              salvarPerfil(atleta.id, { foto });
              setAberto(false);
              avisar('Foto salva. Agora o treinador te reconhece na lista.', 'sucesso');
            }}
          />
        )}
      </Dialogo>
    </>
  );
}
