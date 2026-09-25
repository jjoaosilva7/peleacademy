/*
 * Rede de cuidado: se o atleta passa 3 treinos seguidos abaixo do esperado,
 * o app sugere fisioterapeuta, psicólogo ou os dois, de acordo com os sinais do check-in.
 */
import type { Atleta, CheckIn, Profissional, Treino } from '../tipos';
import { FALHAS, TREINO_BOM, treinosDoAtleta } from './desempenho';
import { ultimosCheckins } from './regras';

export const NOME_PROFISSIONAL: Record<Profissional, string> = {
  fisio: 'Fisioterapeuta',
  psicologo: 'Psicólogo do esporte',
};

export interface Recomendacao {
  profissionais: Profissional[];
  motivo: string;
  detalhes: string[];
}

const media = (lista: CheckIn[], campo: 'sono' | 'dor' | 'cansaco' | 'estresse') =>
  lista.reduce((s, c) => s + c[campo], 0) / (lista.length || 1);

export function verificarCuidado(atleta: Atleta, treinos: Treino[]): Recomendacao | null {
  if (atleta.status !== 'academia') return null;
  const ultimos3 = treinosDoAtleta(atleta.id, treinos).slice(-3);
  const checkins = ultimosCheckins(atleta, 3);
  const treinosRuins = ultimos3.length === 3 && ultimos3.every((t) => t.nota < TREINO_BOM);

  const dorAlta = checkins.length === 3 && media(checkins, 'dor') <= 2.5;
  const cansacoAlto = checkins.length === 3 && media(checkins, 'cansaco') <= 2.5;
  const cabecaPesada = checkins.length === 3 && (media(checkins, 'estresse') <= 2.5 || media(checkins, 'sono') <= 2.5);
  const falhaFisica = ultimos3.some((t) => t.registro.falhas.some((f) => FALHAS[f].atributo === 'forca'));

  const profissionais = new Set<Profissional>();
  const detalhes: string[] = [];
  if (dorAlta) detalhes.push('Dor muscular relatada nos últimos 3 check-ins');
  if (cansacoAlto) detalhes.push('Cansaço alto nos últimos 3 check-ins');
  if (cabecaPesada) detalhes.push('Sono ruim ou estresse alto nos últimos 3 check-ins');
  if (treinosRuins) detalhes.push('3 treinos seguidos com nota abaixo de 6,5');

  if (dorAlta || (treinosRuins && (falhaFisica || cansacoAlto))) profissionais.add('fisio');
  if (cabecaPesada) profissionais.add('psicologo');
  if (treinosRuins && profissionais.size === 0) profissionais.add('psicologo');

  if (profissionais.size === 0) return null;
  const motivo = treinosRuins
    ? 'Seus últimos 3 treinos ficaram abaixo do esperado.'
    : 'Seus últimos check-ins mostram sinais de alerta.';
  return { profissionais: [...profissionais], motivo, detalhes };
}
