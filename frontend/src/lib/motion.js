/**
 * @file motion.js
 * @description Vocabulário de animação compartilhado.
 *
 * Centralizar as variantes evita que cada componente invente sua própria
 * duração e curva — é o que diferencia uma interface com linguagem de
 * movimento de uma com animações avulsas.
 */

/** Desaceleração longa. Mesma curva do token `ease-out` do Tailwind. */
export const EASE_OUT = [0.22, 1, 0.36, 1];

/** Revelação padrão ao entrar na viewport. */
export const revealUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

/** Container que escalona a entrada dos filhos. */
export const staggerChildren = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/**
 * Configuração de viewport usada nas revelações.
 *
 * `once` evita que o elemento reanime a cada passagem — reanimar em todo
 * scroll é o que faz uma página parecer inquieta.
 */
export const viewportOnce = { once: true, amount: 0.3, margin: '0px 0px -80px 0px' };

/**
 * Devolve variantes neutras quando o usuário pediu menos movimento.
 *
 * @param {boolean} reduce - Resultado de `useReducedMotion()`.
 * @param {object} variants - Variantes originais.
 * @returns {object} Variantes com deslocamento removido.
 */
export const respectMotion = (reduce, variants) =>
  reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : variants;
