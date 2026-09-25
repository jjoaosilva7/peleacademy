/*
 * Logo da Pelé Academia em vetor, redesenhado a partir da imagem enviada.
 * Cada peça é um caminho separado para a animação conseguir "desenhar" uma de cada vez.
 * Quando tiver o SVG oficial da marca, troque os valores de "d" pelas formas oficiais
 * (mantenha as mesmas chaves) e a animação continua funcionando.
 * Sistema de coordenadas: viewBox "14 12 164 46".
 */

export const VIEWBOX = '14 12 164 46';

/** Dourado do logo, medido na imagem original. */
export const OURO_LOGO = '#d9ab4d';

export interface PecaLogo {
  id: string;
  d: string;
  /** Pontos de ancoragem mostrados durante o "desenho" (como no editor vetorial) */
  ancoras: [number, number][];
  regraPreenchimento?: 'evenodd';
}

export const PECAS: PecaLogo[] = [
  {
    id: 'p',
    d: 'M20 28.3 H32.3 Q35 28.3 35 31 V34 Q35 36.7 32.3 36.7 H23.3 V41.7 H20 Z M23.3 31 H31.7 V34 H23.3 Z',
    ancoras: [[20, 28.3], [32.3, 28.3], [35, 31], [35, 34], [32.3, 36.7], [23.3, 41.7], [20, 41.7]],
    regraPreenchimento: 'evenodd',
  },
  {
    id: 'e',
    d: 'M37 28.3 H50 V31.1 H40.3 V33.6 H48.4 V36.4 H40.3 V38.9 H50 V41.7 H37 Z',
    ancoras: [[37, 28.3], [50, 28.3], [48.4, 33.6], [50, 41.7], [37, 41.7]],
  },
  {
    id: 'l',
    d: 'M52 28.3 H55.3 V38.9 H63.6 V41.7 H52 Z',
    ancoras: [[52, 28.3], [55.3, 28.3], [63.6, 38.9], [52, 41.7]],
  },
  {
    id: 'e2',
    d: 'M66 28.3 H79.3 V31.1 H69.3 V33.6 H77.6 V36.4 H69.3 V38.9 H79.3 V41.7 H66 Z M73.6 23.8 L77 23.8 L74.3 27.1 L71.1 27.1 Z',
    ancoras: [[66, 28.3], [79.3, 28.3], [77.6, 36.4], [79.3, 41.7], [73.6, 23.8], [66, 41.7]],
  },
  {
    id: 'figura',
    d: 'M91.03 17.25 Q90.31 17.00 89.50 18.25 Q88.69 19.50 88.53 20.91 Q88.38 22.31 88.72 23.34 Q89.06 24.38 90.50 25.81 Q91.94 27.25 91.97 30.19 Q92.00 33.12 90.12 37.38 Q88.25 41.62 87.38 42.97 Q86.50 44.31 86.06 46.06 Q85.62 47.81 84.38 49.34 Q83.12 50.88 83.09 51.44 Q83.06 52.00 83.34 52.22 Q83.62 52.44 84.09 52.31 Q84.56 52.19 85.94 50.91 Q87.31 49.62 87.38 48.69 Q87.44 47.75 88.56 46.50 Q89.69 45.25 90.16 44.03 Q90.62 42.81 92.88 40.81 Q95.12 38.81 96.78 39.94 Q98.44 41.06 101.19 44.44 Q103.94 47.81 105.09 50.22 Q106.25 52.62 107.09 53.00 Q107.94 53.38 108.22 52.94 Q108.50 52.50 108.38 52.00 Q108.25 51.50 107.38 50.22 Q106.50 48.94 105.34 46.22 Q104.19 43.50 103.16 42.50 Q102.12 41.50 100.53 37.59 Q98.94 33.69 99.38 30.88 Q99.81 28.06 100.31 27.84 Q100.81 27.62 101.31 27.91 Q101.81 28.19 101.34 29.50 Q100.88 30.81 101.38 31.12 Q101.88 31.44 103.25 29.88 Q104.62 28.31 104.66 27.72 Q104.69 27.12 104.12 26.34 Q103.56 25.56 102.34 24.91 Q101.12 24.25 99.34 23.94 Q97.56 23.62 97.34 21.97 Q97.12 20.31 96.56 19.75 Q96.00 19.19 95.47 19.28 Q94.94 19.38 94.47 19.84 Q94.00 20.31 93.69 21.97 Q93.38 23.62 92.53 23.53 Q91.69 23.44 91.16 21.84 Q90.62 20.25 91.19 18.88 Q91.75 17.50 91.03 17.25Z',
    ancoras: [[90.3, 17.0], [92.0, 33.1], [83.1, 52.0], [89.7, 45.2], [106.2, 52.6], [104.2, 43.5], [101.8, 28.2], [103.6, 25.6], [94.9, 19.4], [91.8, 17.5]],
  },
  {
    id: 'caixa',
    d: 'M111 30.2 H171.6 V40.6 H111 Z',
    ancoras: [[111, 30.2], [171.6, 30.2], [171.6, 40.6], [111, 40.6]],
  },
];

/** Centro da figura, usado como ponto de partida do zoom de saída (em % do viewBox). */
export const ORIGEM_ZOOM = { x: ((95 - 14) / 164) * 100, y: ((35 - 12) / 46) * 100 };
