export function ler<T>(chave: string): T | null {
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : null;
  } catch {
    return null;
  }
}

export function gravar(chave: string, valor: unknown): void {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Armazenamento indisponível: o app continua funcionando em memória.
  }
}

export function remover(chave: string): void {
  try {
    window.localStorage.removeItem(chave);
  } catch {
    // Sem armazenamento disponível, não há o que remover.
  }
}
