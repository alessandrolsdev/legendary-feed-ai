/**
 * @file ScrollProgress.jsx
 * @description Barra fina no topo indicando o avanço na narrativa.
 */

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';

/**
 * Indicador de progresso de leitura.
 *
 * Numa página longa, dá ao usuário a noção de quanto falta — o equivalente
 * à espessura das páginas restantes num livro.
 *
 * @returns {JSX.Element}
 */
function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // A mola remove o efeito "degrau" do scroll por roda do mouse.
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: reduce ? scrollYProgress : scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-brand-violet via-brand-pink to-brand-ember"
    />
  );
}

export default ScrollProgress;
