/*
 * Envio da foto 3x4. O atleta escolhe uma imagem, ajusta zoom e posição dentro da moldura
 * e o app recorta no tamanho 300x400 (proporção 3x4) antes de salvar.
 */
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { ImageUp, RotateCcw } from 'lucide-react';
import { Botao } from '../ui/Botao';
import { MensagemErro } from '../ui/Campo';

const LARGURA = 300;
const ALTURA = 400;
const MOLDURA = 240; // largura da moldura na tela; altura = 320
const TAMANHO_MAXIMO = 8 * 1024 * 1024;

interface Props {
  aoSalvar: (dataUrl: string) => void;
  aoCancelar: () => void;
}

export function EditorFoto({ aoSalvar, aoCancelar }: Props) {
  const [imagem, setImagem] = useState<HTMLImageElement | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [posicao, setPosicao] = useState({ x: 0, y: 0 });
  const arrasto = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const entrada = useRef<HTMLInputElement>(null);

  const escalaBase = imagem ? Math.max(MOLDURA / imagem.width, (MOLDURA * 4) / 3 / imagem.height) : 1;
  const escala = escalaBase * zoom;

  useEffect(() => setPosicao({ x: 0, y: 0 }), [imagem]);

  function escolher(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    setErro(null);
    if (!arquivo) return;
    if (!/^image\/(jpeg|png|webp)$/.test(arquivo.type)) return setErro('Envie uma foto em JPG, PNG ou WEBP.');
    if (arquivo.size > TAMANHO_MAXIMO) return setErro('A foto passa de 8 MB. Escolha uma menor.');
    const leitor = new FileReader();
    leitor.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (img.width < LARGURA || img.height < ALTURA) {
          setErro(`A foto é pequena demais (${img.width}x${img.height}). Use pelo menos 300x400 pixels.`);
          return;
        }
        setZoom(1);
        setImagem(img);
      };
      img.onerror = () => setErro('Não foi possível abrir essa imagem. Tente outra.');
      img.src = String(leitor.result);
    };
    leitor.readAsDataURL(arquivo);
  }

  function limitarPosicao(x: number, y: number) {
    if (!imagem) return { x, y };
    const folgaX = Math.max(0, (imagem.width * escala - MOLDURA) / 2);
    const folgaY = Math.max(0, (imagem.height * escala - (MOLDURA * 4) / 3) / 2);
    return { x: Math.max(-folgaX, Math.min(folgaX, x)), y: Math.max(-folgaY, Math.min(folgaY, y)) };
  }

  function iniciarArrasto(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    arrasto.current = { x: e.clientX, y: e.clientY, px: posicao.x, py: posicao.y };
  }

  function arrastar(e: PointerEvent<HTMLDivElement>) {
    if (!arrasto.current) return;
    const a = arrasto.current;
    setPosicao(limitarPosicao(a.px + e.clientX - a.x, a.py + e.clientY - a.y));
  }

  function moverComTeclado(e: KeyboardEvent<HTMLDivElement>) {
    const passos: Record<string, [number, number]> = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, -8], ArrowDown: [0, 8] };
    const passo = passos[e.key];
    if (!passo) return;
    e.preventDefault();
    setPosicao((p) => limitarPosicao(p.x + passo[0], p.y + passo[1]));
  }

  function salvar() {
    if (!imagem) return;
    const tela = document.createElement('canvas');
    tela.width = LARGURA;
    tela.height = ALTURA;
    const ctx = tela.getContext('2d');
    if (!ctx) return setErro('Seu navegador não conseguiu recortar a foto.');
    const fator = LARGURA / MOLDURA;
    const largura = imagem.width * escala * fator;
    const altura = imagem.height * escala * fator;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, LARGURA, ALTURA);
    ctx.drawImage(imagem, (LARGURA - largura) / 2 + posicao.x * fator, (ALTURA - altura) / 2 + posicao.y * fator, largura, altura);
    aoSalvar(tela.toDataURL('image/jpeg', 0.85));
  }

  return (
    <div>
      <ul className="mb-4 list-disc pl-5 text-sm text-tinta-suave">
        <li>Rosto de frente, do ombro para cima, como em documento.</li>
        <li>Fundo liso e claro, sem boné nem óculos escuros.</li>
        <li>Não use foto de corpo inteiro nem jogando.</li>
      </ul>

      <div className="flex flex-col items-center gap-4">
        <div
          role={imagem ? 'application' : undefined}
          aria-label={imagem ? 'Moldura 3x4. Arraste ou use as setas para posicionar o rosto.' : undefined}
          tabIndex={imagem ? 0 : -1}
          onKeyDown={moverComTeclado}
          onPointerDown={imagem ? iniciarArrasto : undefined}
          onPointerMove={arrastar}
          onPointerUp={() => (arrasto.current = null)}
          className={`relative aspect-3/4 w-60 touch-none select-none overflow-hidden rounded-lg bg-superficie-2 ${imagem ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          {imagem ? (
            <img
              src={imagem.src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
              style={{
                width: imagem.width * escala,
                height: imagem.height * escala,
                transform: `translate(calc(-50% + ${posicao.x}px), calc(-50% + ${posicao.y}px))`,
              }}
            />
          ) : (
            <button type="button" onClick={() => entrada.current?.click()} className="flex size-full flex-col items-center justify-center gap-2 text-tinta-suave hover:text-tinta">
              <ImageUp aria-hidden="true" className="size-8" />
              <span className="font-semibold">Escolher foto</span>
            </button>
          )}
          <svg aria-hidden="true" viewBox="0 0 30 40" className="pointer-events-none absolute inset-0 size-full">
            <ellipse cx="15" cy="16" rx="8" ry="10.5" fill="none" stroke="white" strokeWidth="0.35" strokeDasharray="1 1" opacity="0.9" />
          </svg>
        </div>

        {imagem && (
          <div className="w-60">
            <label htmlFor="zoom-foto" className="text-sm font-semibold text-tinta">Zoom</label>
            <input id="zoom-foto" type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mt-1 w-full accent-marca" />
          </div>
        )}
        {erro && <div className="w-full"><MensagemErro id="erro-foto">{erro}</MensagemErro></div>}
      </div>

      <input ref={entrada} type="file" accept="image/jpeg,image/png,image/webp" onChange={escolher} className="sr-only" tabIndex={-1} aria-hidden="true" />

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        {imagem && (
          <Botao variante="fantasma" onClick={() => entrada.current?.click()}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Trocar foto
          </Botao>
        )}
        <Botao variante="contorno" onClick={aoCancelar}>Cancelar</Botao>
        <Botao variante="marca" onClick={salvar} disabled={!imagem}>Salvar foto</Botao>
      </div>
    </div>
  );
}
