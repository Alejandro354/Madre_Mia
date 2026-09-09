// `requisitos` y `beneficios` son campos de texto libre en el backend, pero el
// diseño los muestra como viñetas y chips. Estas funciones los parten sin
// obligar a cambiar el modelo.

/** Texto → viñetas. Prefiere saltos de línea; si no hay, parte por frases. */
export function splitSentences(text) {
  if (!text) return []

  const byLine = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (byLine.length > 1) return byLine

  return text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter(Boolean)
}

/** Texto → items cortos (chips). Parte por líneas, comas y " y ". */
export function splitItems(text) {
  if (!text) return []

  const byLine = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  const source = byLine.length > 1 ? byLine : [text]

  return source
    .flatMap((line) => line.split(/,| y (?=[a-záéíóúñ])/i))
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
}
