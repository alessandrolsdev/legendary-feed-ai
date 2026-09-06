/**
 * @file markdown.js
 * @description Utilitários para lidar com formatação Markdown residual nos
 * textos gerados pela IA.
 *
 * O backend pede texto puro ao modelo e o contrato entrega campos curtos
 * (contexto, título, análise e veredito), então não há blocos de Markdown a
 * interpretar — não existe cabeçalho nem lista dentro de duas frases. O que
 * escapa na prática é ênfase inline (`**assim**`) e, ocasionalmente, um
 * marcador solto no início da frase. É exatamente isso que tratamos aqui.
 */

/** Marcadores de bloco que podem sobrar no início de uma linha. */
const BLOCK_MARKERS = /^[ \t]*(?:#{1,6}[ \t]+|[-*+][ \t]+|\d+\.[ \t]+|>[ \t]?)/gm;

/**
 * Captura ênfase inline.
 *
 * Duas regras do CommonMark que importam aqui:
 *
 * 1. O delimitador precisa ser adjacente a um caractere não-branco. Sem isso,
 *    `5 * 3 = 15 e 2 * 4 = 8` seria lido como itálico entre os asteriscos.
 * 2. `_` não marca ênfase no meio de uma palavra, senão `snake_case_name`
 *    apareceria parcialmente em itálico.
 *
 * A ordem da alternância também importa: `**` é testado antes de `*`, senão o
 * delimitador duplo é consumido como dois simples.
 */
const INLINE_TOKENS = new RegExp(
  '(' +
    [
      '\\*\\*\\S(?:[^*\\n]*\\S)?\\*\\*', // **negrito**
      '(?<![\\wÀ-ÿ])__\\S(?:[^_\\n]*\\S)?__(?![\\wÀ-ÿ])', // __negrito__
      '\\*\\S(?:[^*\\n]*\\S)?\\*', // *itálico*
      '(?<![\\wÀ-ÿ])_\\S(?:[^_\\n]*\\S)?_(?![\\wÀ-ÿ])', // _itálico_
      '`[^`\\n]+`', // `código`
    ].join('|') +
    ')',
);

/**
 * Remove marcadores de bloco e normaliza espaços em branco.
 *
 * @param {string} text - Texto bruto.
 * @returns {string} Texto sem marcadores de bloco.
 */
export const stripBlockMarkers = (text) =>
  String(text ?? '')
    .replace(BLOCK_MARKERS, '')
    .trim();

/**
 * Quebra o texto em tokens tipados de ênfase inline.
 *
 * @param {string} text - Texto já sem marcadores de bloco.
 * @returns {Array<{type: 'text'|'bold'|'italic'|'code', value: string}>}
 */
export const splitInlineMarkdown = (text) => {
  const source = String(text ?? '');
  if (!source) return [];

  return source
    .split(INLINE_TOKENS)
    .filter((chunk) => chunk !== '' && chunk !== undefined)
    .map((chunk) => {
      if (
        (chunk.startsWith('**') && chunk.endsWith('**')) ||
        (chunk.startsWith('__') && chunk.endsWith('__'))
      ) {
        return { type: 'bold', value: chunk.slice(2, -2) };
      }
      if (chunk.startsWith('`') && chunk.endsWith('`') && chunk.length > 2) {
        return { type: 'code', value: chunk.slice(1, -1) };
      }
      if (
        ((chunk.startsWith('*') && chunk.endsWith('*')) ||
          (chunk.startsWith('_') && chunk.endsWith('_'))) &&
        chunk.length > 2
      ) {
        return { type: 'italic', value: chunk.slice(1, -1) };
      }
      return { type: 'text', value: chunk };
    });
};

/**
 * Devolve o texto sem qualquer marcação, para usos que não aceitam JSX
 * (compartilhamento, `alt`, área de transferência).
 *
 * @param {string} text - Texto bruto.
 * @returns {string} Texto limpo.
 */
export const toPlainText = (text) =>
  splitInlineMarkdown(stripBlockMarkers(text))
    .map((token) => token.value)
    .join('');
