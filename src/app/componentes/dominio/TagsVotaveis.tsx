import { Check, Plus } from 'lucide-react';
import type { Tag } from '../../tipos';

interface Props {
  tags: Tag[];
  usuarioId: string | null;
  aoVotar?: (tag: Tag) => void;
}

/** Atributos do atleta confirmados pela rede. Com `aoVotar`, cada atributo vira um botão alternável. */
export function TagsVotaveis({ tags, usuarioId, aoVotar }: Props) {
  if (tags.length === 0) return <p className="text-tinta-suave">Nenhum atributo registrado ainda.</p>;
  const ordenadas = [...tags].sort((a, b) => b.votos.length - a.votos.length);

  return (
    <ul className="flex flex-wrap gap-2">
      {ordenadas.map((tag) => {
        const votou = usuarioId ? tag.votos.includes(usuarioId) : false;
        const conteudo = (
          <>
            {aoVotar && (votou ? <Check aria-hidden="true" className="size-4" /> : <Plus aria-hidden="true" className="size-4" />)}
            <span>{tag.nome}</span>
            <span className={`rounded-full px-1.5 text-sm font-semibold ${votou ? 'bg-cromo/40' : 'bg-superficie-2'}`}>
              {tag.votos.length}
              <span className="sr-only"> {tag.votos.length === 1 ? 'confirmação' : 'confirmações'}</span>
            </span>
          </>
        );
        return (
          <li key={tag.id}>
            {aoVotar ? (
              <button
                type="button"
                aria-pressed={votou}
                onClick={() => aoVotar(tag)}
                className={
                  'inline-flex min-h-11 items-center gap-2 rounded-md border px-3 font-semibold transition-colors ' +
                  (votou ? 'border-marca bg-marca text-sobre-marca hover:bg-marca-forte' : 'border-linha bg-superficie text-tinta hover:border-tinta-suave hover:bg-superficie-2')
                }
              >
                {conteudo}
              </button>
            ) : (
              <span className="inline-flex min-h-9 items-center gap-2 rounded-md border border-linha px-3 font-semibold text-tinta">{conteudo}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
