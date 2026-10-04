/**
 * @file constants.js
 * @description Limites e formatos aceitos no upload.
 *
 * Os metadados de cada tier (cor, descrição, exemplos) vivem em `tiers.js`,
 * que é a fonte única consumida tanto pelo capítulo narrativo quanto pela
 * carta de resultado.
 */

/**
 * Indica se o tier é o lendário.
 *
 * Tolera `undefined`/`null`: a versão anterior chamava `rarity.includes('SSS')`
 * diretamente e quebrava a tela inteira se o campo viesse ausente.
 *
 * @param {string} [tier] - Tier de raridade.
 * @returns {boolean}
 */
export const isLegendary = (tier) => String(tier ?? '').includes('SSS');

/** Formatos que o backend aceita decodificar. */
export const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
];

/** Deve espelhar `MAX_UPLOAD_BYTES` no backend. */
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
