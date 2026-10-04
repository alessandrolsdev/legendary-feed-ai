/**
 * @file TierScrolly.jsx
 * @description Capítulo narrativo dos tiers: uma cena fixa cujo conteúdo
 * avança conforme o scroll percorre a seção.
 */

import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';

import { TIERS } from '../lib/tiers';
import { EASE_OUT, revealUp, staggerChildren, viewportOnce } from '../lib/motion';

/** Altura da seção por tier. Define o "tempo" de leitura de cada passo. */
const VH_PER_TIER = 85;

/** Empilha os painéis na mesma célula de grid, para que coexistam no espaço. */
const STACK = { gridArea: '1 / 1' };

/**
 * Painel de um tier: emblema e texto.
 *
 * @param {object} props
 * @param {typeof TIERS[number]} props.tier
 * @param {boolean} props.active - Se é o tier em foco.
 * @param {boolean} props.reduce - Se o usuário pediu menos movimento.
 * @returns {JSX.Element}
 */
function TierPanel({ tier, active, reduce }) {
  return (
    <motion.div
      style={STACK}
      initial={false}
      animate={{ opacity: active ? 1 : 0, y: active || reduce ? 0 : 16 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      aria-hidden={!active}
      className={`flex flex-col items-center gap-8 sm:flex-row sm:gap-10 lg:gap-14 ${
        active ? '' : 'pointer-events-none'
      }`}
    >
      <div className="relative flex shrink-0 items-center justify-center">
        <div
          aria-hidden="true"
          className="absolute h-56 w-56 rounded-full blur-[90px] sm:h-72 sm:w-72"
          style={{ backgroundColor: tier.glow }}
        />
        <div
          className={`relative flex h-36 w-36 items-center justify-center rounded-[2rem] border border-line bg-ink-raised/80 ring-1 backdrop-blur-xl sm:h-48 sm:w-48 lg:h-56 lg:w-56 ${tier.ring}`}
        >
          <span
            className={`bg-gradient-to-br bg-clip-text font-display text-5xl font-extrabold text-transparent sm:text-6xl lg:text-7xl ${tier.gradient}`}
          >
            {tier.rank}
          </span>
        </div>
      </div>

      <div className="min-w-0 max-w-md text-center sm:text-left">
        <p className={`label-mono mb-3 ${tier.accent}`}>{tier.id}</p>
        <h3 className="font-display text-4xl font-extrabold uppercase text-white sm:text-5xl">
          {tier.name}
        </h3>
        <p className={`mt-3 text-lg font-medium ${tier.accent}`}>{tier.tagline}</p>
        <p className="mt-4 text-pretty leading-relaxed text-slate-400">{tier.description}</p>

        <ul className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
          {tier.examples.map((example) => (
            <li
              key={example}
              className="rounded-full border border-line bg-white/[0.03] px-3 py-1 label-mono text-slate-400"
            >
              {example}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/**
 * Versão estática, usada quando o usuário pede menos movimento.
 *
 * Mantém a mesma informação em grid, sem cena fixa nem transição — o
 * conteúdo não pode depender da animação para existir.
 *
 * @returns {JSX.Element}
 */
function TierGrid() {
  return (
    <div className="mx-auto grid max-w-content gap-6 px-6 sm:grid-cols-2">
      {TIERS.map((tier) => (
        <article key={tier.id} className="surface p-8">
          <div className="mb-6 flex items-center gap-4">
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-line bg-ink-raised font-display text-2xl font-extrabold ${tier.accent}`}
            >
              {tier.rank}
            </span>
            <div>
              <p className="label-mono">{tier.id}</p>
              <h3 className="font-display text-2xl font-extrabold uppercase text-white">
                {tier.name}
              </h3>
            </div>
          </div>
          <p className={`mb-2 font-medium ${tier.accent}`}>{tier.tagline}</p>
          <p className="text-sm leading-relaxed text-slate-400">{tier.description}</p>
        </article>
      ))}
    </div>
  );
}

/**
 * Seção dos tiers.
 *
 * A cena fica fixa enquanto a página rola por uma faixa alta; o progresso do
 * scroll escolhe qual tier está em foco.
 *
 * Os quatro painéis ficam empilhados na mesma célula de grid e trocam por
 * fusão cruzada. Uma alternativa seria montar e desmontar com
 * `AnimatePresence mode="wait"`, mas aí a saída de um painel precisa terminar
 * antes da entrada do próximo — o que deixa a cena vazia por quase um segundo
 * durante um scroll contínuo.
 *
 * @returns {JSX.Element}
 */
function TierScrolly() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const index = Math.floor(value * TIERS.length);
    setActive(Math.min(TIERS.length - 1, Math.max(0, index)));
  });

  const heading = (
    <motion.header
      variants={staggerChildren}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="mx-auto mb-16 max-w-content px-6 text-center"
    >
      <motion.p variants={revealUp} className="label-mono mb-4">
        Capítulo 01 — O julgamento
      </motion.p>
      <motion.h2
        variants={revealUp}
        className="font-display text-display-sm font-extrabold uppercase text-white"
      >
        Quatro tiers.
        <br />
        <span className="text-gradient-brand">Um júri exigente.</span>
      </motion.h2>
      <motion.p variants={revealUp} className="mx-auto mt-6 max-w-xl text-pretty text-slate-400">
        A nota não é aleatória. Cada tier tem critério, e o lendário é
        deliberadamente difícil — raridade que se dá de graça não vale nada.
      </motion.p>
    </motion.header>
  );

  if (reduce) {
    return (
      <section id="tiers" className="py-24">
        {heading}
        <TierGrid />
      </section>
    );
  }

  return (
    <section id="tiers" className="py-24">
      {heading}

      <div ref={ref} style={{ height: `${TIERS.length * VH_PER_TIER}vh` }}>
        <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
          <div className="mx-auto flex w-full max-w-4xl items-center gap-6 px-6 sm:gap-10">
            {/* Trilha vertical: âncora visual do par emblema + texto. */}
            <ol aria-hidden="true" className="hidden shrink-0 flex-col gap-2 lg:flex">
              {TIERS.map((tier, index) => (
                <li
                  key={tier.id}
                  className={`w-1 rounded-full transition-all duration-500 ease-out ${
                    index === active ? 'h-14 bg-white' : 'h-8 bg-white/15'
                  }`}
                />
              ))}
            </ol>

            {/* A grid de célula única dimensiona-se pelo painel mais alto,
                então a cena não "pula" ao trocar de tier. */}
            <div className="grid w-full">
              {TIERS.map((tier, index) => (
                <TierPanel
                  key={tier.id}
                  tier={tier}
                  active={index === active}
                  reduce={reduce}
                />
              ))}
            </div>

            {/* Mesma trilha, deitada, para telas estreitas. */}
            <ol
              aria-hidden="true"
              className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-2 lg:hidden"
            >
              {TIERS.map((tier, index) => (
                <li
                  key={tier.id}
                  className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                    index === active ? 'w-8 bg-white' : 'w-3 bg-white/20'
                  }`}
                />
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Os painéis visuais ficam `aria-hidden` enquanto inativos, para não
          serem lidos em duplicata. Este resumo garante que quem usa leitor de
          tela receba os quatro tiers sem depender da posição do scroll. */}
      <div className="sr-only">
        <h3>Resumo dos tiers</h3>
        <dl>
          {TIERS.map((tier) => (
            <div key={tier.id}>
              <dt>{`${tier.id} — ${tier.name}`}</dt>
              <dd>{tier.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default TierScrolly;
