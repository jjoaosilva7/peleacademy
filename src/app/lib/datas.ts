const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

function doisDigitos(n: number) {
  return String(n).padStart(2, '0');
}

export function paraISO(data: Date): string {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

export function deISO(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function hojeISO(): string {
  return paraISO(new Date());
}

export function somarDias(iso: string, dias: number): string {
  const data = deISO(iso);
  data.setDate(data.getDate() + dias);
  return paraISO(data);
}

export function diasEntre(inicioISO: string, fimISO: string): number {
  return Math.round((deISO(fimISO).getTime() - deISO(inicioISO).getTime()) / 86_400_000);
}

export function dataCurta(iso: string): string {
  const d = deISO(iso);
  return `${d.getDate()} ${MESES_CURTOS[d.getMonth()]}`;
}

export function dataLonga(iso: string): string {
  const d = deISO(iso);
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function diaDaSemana(iso: string): string {
  return DIAS_SEMANA[deISO(iso).getDay()];
}

export function textoPrazo(dias: number): string {
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'amanhã';
  return `em ${dias} dias`;
}
