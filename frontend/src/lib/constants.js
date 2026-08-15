/**
 * @file constants.js
 * @description Valores compartilhados entre os componentes da interface.
 */

/** Tiers de raridade, na ordem canônica. */
export const TIERS = {
  COMMON: 'TIER C',
  RARE: 'TIER B',
  EPIC: 'TIER A',
  LEGENDARY: 'TIER SSS',
};

/**
 * Gradiente Tailwind de cada tier.
 * O backend garante que `rarity` é sempre um destes valores.
 */
const RARITY_COLORS = {
  [TIERS.LEGENDARY]: 'from-yellow-400 via-orange-500 to-yellow-600',
  [TIERS.EPIC]: 'from-purple-500 to-indigo-600',
  [TIERS.RARE]: 'from-blue-400 to-cyan-500',
  [TIERS.COMMON]: 'from-gray-500 to-gray-700',
};

const DEFAULT_COLOR = 'from-gray-500 to-gray-700';

/**
 * Retorna as classes de gradiente correspondentes a um tier.
 *
 * @param {string} [tier] - Tier de raridade.
 * @returns {string} Classes Tailwind de gradiente.
 */
export const getRarityColor = (tier) => RARITY_COLORS[tier] ?? DEFAULT_COLOR;

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
