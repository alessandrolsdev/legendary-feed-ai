/**
 * @file Hero.jsx
 * @description Abertura da página: tipografia display, proposta em uma frase
 * e o caminho direto para a ferramenta.
 */

import { ArrowDown, Sparkles } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

import { EASE_OUT } from '../lib/motion';

/** Palavras do título, animadas uma a uma. */
const TITLE_WORDS = ['LEGENDARY', 'FEED'];

/**
 * Seção de abertura.
 *
 * @param {object} props
 * @param {() => void} props.onStart - Leva o usuário até o analisador.
 * @returns {JSX.Element}
 */
function Hero({ onStart }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Parallax discreto: o hero recua enquanto o próximo capítulo sobe.
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 pt-20"
    >
      {/* Campo de luz ao fundo. Puramente decorativo. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[18%] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-brand-violet/20 blur-[140px] motion-safe:animate-float-slow" />
        <div className="absolute bottom-[8%] right-[6%] h-[26rem] w-[26rem] rounded-full bg-brand-ember/10 blur-[120px]" />
        <div className="absolute inset-0 bg-grain opacity-[0.035] mix-blend-overlay" />
      </div>

      <motion.div
        style={reduce ? undefined : { y, opacity }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-violet/30 bg-brand-violet/10 px-4 py-1.5 label-mono text-brand-violet"
        >
          <Sparkles size={12} aria-hidden="true" />
          Beta · Mode Engineer
        </motion.span>

        <h1 className="font-display text-display-lg font-extrabold uppercase leading-none">
          {TITLE_WORDS.map((word, index) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: reduce ? 0 : '0.3em' }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 + index * 0.1, ease: EASE_OUT }}
              className="block text-gradient-brand"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: EASE_OUT }}
          className="mt-8 max-w-xl text-balance text-base leading-relaxed text-slate-400 sm:text-lg"
        >
          Manda uma foto. Um júri com opinião forte decide se ela é comum,
          rara, épica — ou lendária o bastante para o Hall da Fama.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: EASE_OUT }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <button
            type="button"
            onClick={onStart}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-brand-violet to-brand-pink px-8 py-4 font-bold text-white shadow-card transition-transform duration-300 ease-out hover:scale-[1.03]"
          >
            <span className="relative z-10">Avaliar minha foto</span>
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
            />
          </button>

          <a
            href="#tiers"
            className="rounded-full border border-line px-8 py-4 text-sm font-bold text-slate-300 transition-colors hover:border-line-strong hover:text-white"
          >
            Ver os tiers
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 flex flex-col items-center gap-2"
      >
        <span className="label-mono text-[0.6rem] text-slate-600">Role</span>
        <ArrowDown size={16} className="text-slate-600 motion-safe:animate-scroll-hint" />
      </motion.div>
    </section>
  );
}

export default Hero;
