/**
 * @file tiers.js
 * @description Metadados dos tiers de raridade, compartilhados pelo capítulo
 * de scroll e pela carta de resultado.
 *
 * Antes os critérios de classificação só existiam no prompt do backend e no
 * README; a interface nunca explicava ao usuário como a nota era decidida.
 */

/** @typedef {'TIER C'|'TIER B'|'TIER A'|'TIER SSS'} TierId */

/**
 * Do mais comum ao mais raro. A ordem é a sequência narrativa da seção.
 */
export const TIERS = [
  {
    id: 'TIER C',
    rank: 'C',
    name: 'Comum',
    tagline: 'O feed de todo mundo.',
    description:
      'Foto tremida, enquadramento no automático, selfie sem intenção. Não é ruim — é só o que a timeline já viu dez mil vezes hoje.',
    examples: ['Selfie no espelho', 'Foto tremida', 'Print de tela'],
    accent: 'text-tier-common',
    ring: 'ring-tier-common/40',
    gradient: 'from-slate-500 to-slate-700',
    glow: 'rgb(148 163 184 / 0.25)',
  },
  {
    id: 'TIER B',
    rank: 'B',
    name: 'Rara',
    tagline: 'Alguém pensou antes de clicar.',
    description:
      'Luz resolvida, composição de pé, sorriso que não foi ensaiado. É a foto que sobrevive à segunda olhada.',
    examples: ['Luz natural', 'Retrato honesto', 'Paisagem limpa'],
    accent: 'text-tier-rare',
    ring: 'ring-tier-rare/40',
    gradient: 'from-sky-400 to-cyan-500',
    glow: 'rgb(56 189 248 / 0.3)',
  },
  {
    id: 'TIER A',
    rank: 'A',
    name: 'Épica',
    tagline: 'Território de quem tem hobby.',
    description:
      'Setup montado com carinho, código na tela, instrumento, igreja, café da manhã bem servido. Coisa de gente que cultiva alguma coisa.',
    examples: ['Setup de PC', 'Código na tela', 'Café', 'Instrumento'],
    accent: 'text-tier-epic',
    ring: 'ring-tier-epic/40',
    gradient: 'from-violet-500 to-indigo-600',
    glow: 'rgb(168 85 247 / 0.35)',
  },
  {
    id: 'TIER SSS',
    rank: 'SSS',
    name: 'Lendária',
    tagline: 'Isso não aparece todo dia.',
    description:
      'Capivara. Camisa de anime. Praia — que em Campo Grande é milagre geográfico. Ou algo tão inusitado que o júri abre exceção.',
    examples: ['Capivara', 'Camisa de anime', 'Praia', 'Inusitado'],
    accent: 'text-tier-legendary',
    ring: 'ring-tier-legendary/50',
    gradient: 'from-amber-400 via-orange-500 to-amber-600',
    glow: 'rgb(245 165 36 / 0.45)',
  },
];

/** Índice por id, para consulta direta a partir da resposta da API. */
const TIER_BY_ID = Object.fromEntries(TIERS.map((tier) => [tier.id, tier]));

/**
 * Retorna os metadados de um tier, com fallback para o comum.
 *
 * @param {string} [id] - Valor de `rarity` vindo da API.
 * @returns {typeof TIERS[number]}
 */
export const getTier = (id) => TIER_BY_ID[id] ?? TIERS[0];
