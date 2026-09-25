/*
 * Cartão do jogador (HTML + CSS): moldura em escudo, faixa lateral com overall, posição e país,
 * foto 3x4 (ou marca-d'água), apelido e os atributos da posição. A cor da moldura muda com o
 * overall: areia (até 59), dourada (60 a 74) e dourada com brilho (75 ou mais).
 * O desenho é em HTML para renderizar igual em qualquer navegador. Formato padrão "reto"
 * (cantos arredondados, tudo na horizontal); o formato "escudo" mantém o recorte com ponta.
 */
import type { Atleta } from '../../tipos';
import { atributosDaPosicao, calcularOverall, faixaDoCartao, SIGLA_POSICAO, type Atributos } from '../../lib/desempenho';
import logo from '../../../assets/pele-logo.png';
import { Bandeira } from './Bandeira';
import './cartao.css';

const LARGURA = { sm: 176, md: 240, lg: 288 };
const FILETE = 'M125 22 L137 35 L156 31 L223 45 L223 248 Q223 255 217 260 L125 327 L33 260 Q27 255 27 248 L27 45 L94 31 L113 35 Z';

export function CartaoJogador({ atleta, atributos, tamanho = 'md', formato = 'reto' }: { atleta: Atleta; atributos: Atributos; tamanho?: keyof typeof LARGURA; formato?: 'reto' | 'escudo' }) {
  const overall = calcularOverall(atributos, atleta.posicao);
  const faixa = faixaDoCartao(overall);
  const lista = atributosDaPosicao(atleta.posicao);
  const nome = atleta.apelido || atleta.nome.split(' ')[0];
  const u = LARGURA[tamanho] / 250;
  const tamanhoNome = Math.min(24, 150 / (nome.length * 0.55));
  const resumo = `Cartão de ${atleta.nome}${atleta.apelido ? `, apelido ${atleta.apelido}` : ''}. Overall ${overall}, ${atleta.posicao}, ${atleta.nacionalidade}. ${lista.map((a) => `${a.nome} ${Math.round(atributos[a.id])}`).join(', ')}.`;

  return (
    <figure aria-label={resumo} className={`cj cj-${faixa} cj-${formato}`} style={{ '--u': `${u}px` } as React.CSSProperties}>
      <div aria-hidden="true" className="cj-moldura" />
      <div aria-hidden="true" className="cj-corpo">
        <div className="cj-foto">
          {atleta.foto ? (
            <img src={atleta.foto} alt="" />
          ) : (
            <div className="cj-marca-dagua">
              <svg viewBox="0 0 84 130" fill="none" stroke="var(--cartao-marca-dagua)" strokeWidth="3">
                <path d="M2 2 L82 2 L82 72 Q82 110 42 128 Q2 110 2 72 Z" />
              </svg>
              <span>PA</span>
            </div>
          )}
        </div>

        <div className="cj-banda">
          <p className="cj-nome" style={{ fontSize: `calc(var(--u) * ${tamanhoNome})` }}>{nome}</p>
          <div className="cj-atributos" style={{ gridTemplateColumns: `repeat(${lista.length}, minmax(0, 1fr))` }}>
            {lista.map((a) => (
              <div key={a.id}>
                <span className="cj-atributo-sigla">{a.sigla}</span>
                <span className="cj-atributo-valor">{Math.round(atributos[a.id])}</span>
              </div>
            ))}
          </div>
          <div className="cj-medalha">
            <img src={logo} alt="" />
          </div>
        </div>

        <div className="cj-faixa">
          <div className="cj-ovr">
            <span className="cj-ovr-rotulo">OVR</span>
            <span className="cj-ovr-numero">{overall}</span>
            <span className="cj-ovr-posicao">{SIGLA_POSICAO[atleta.posicao]}</span>
            <span className="cj-ovr-linha" />
            <Bandeira pais={atleta.nacionalidade} className="cj-ovr-bandeira" />
          </div>
          {formato === 'reto' && atleta.numero !== null && <span className="cj-numero">#{atleta.numero}</span>}
        </div>
        <div className="cj-wordmark"><span>PELÉ ACADEMIA</span></div>
      </div>
      <svg aria-hidden="true" className="cj-filete" viewBox="0 0 250 350" preserveAspectRatio="none">
        <path d={FILETE} fill="none" stroke="var(--medio)" strokeWidth="0.8" opacity="0.55" />
      </svg>
    </figure>
  );
}
