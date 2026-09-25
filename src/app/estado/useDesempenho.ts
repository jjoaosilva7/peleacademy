import { useMemo } from 'react';
import type { Atleta } from '../tipos';
import { atributosAtuais, calcularOverall, type Atributos } from '../lib/desempenho';
import { useEstado } from './EstadoApp';

/** Atributos e overall calculados a partir do histórico de notas, com cache por atleta. */
export function useDesempenho() {
  const { db } = useEstado();
  return useMemo(() => {
    const cache = new Map<string, Atributos>();
    const atributos = (a: Atleta) => {
      if (!cache.has(a.id)) cache.set(a.id, atributosAtuais(a, db.treinos));
      return cache.get(a.id)!;
    };
    const overall = (a: Atleta) => calcularOverall(atributos(a), a.posicao);
    return { atributos, overall };
  }, [db]);
}
