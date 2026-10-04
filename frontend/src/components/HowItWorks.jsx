/**
 * @file HowItWorks.jsx
 * @description Capítulo do pipeline: o que acontece com a foto entre o
 * upload e a carta, incluindo o que o projeto descarta antes de enviar.
 */

import { Cpu, Eraser, ScanLine, Sparkles, Upload } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import { respectMotion, revealUp, staggerChildren, viewportOnce } from '../lib/motion';

/**
 * Etapas do pipeline. A ordem espelha o caminho real da requisição.
 */
const STEPS = [
  {
    icon: Upload,
    title: 'Você envia',
    body: 'JPG, PNG ou WEBP até 8 MB. A leitura é interrompida no limite, sem carregar o arquivo inteiro na memória.',
  },
  {
    icon: ScanLine,
    title: 'O formato é conferido',
    body: 'O tipo é decidido pelos bytes reais do arquivo, não pela extensão nem pelo que o navegador declara.',
  },
  {
    icon: Eraser,
    title: 'Os metadados caem',
    body: 'A foto é reencodada antes de sair daqui. O EXIF — inclusive as coordenadas de GPS — fica para trás.',
    highlight: true,
  },
  {
    icon: Cpu,
    title: 'O júri julga',
    body: 'O modelo identifica o contexto da cena antes de decidir a nota, e devolve título, análise técnica e veredito.',
  },
];

/**
 * Seção explicativa, em grid modular.
 *
 * @returns {JSX.Element}
 */
function HowItWorks() {
  const reduce = useReducedMotion();
  const reveal = respectMotion(reduce, revealUp);

  return (
    <section id="como-funciona" className="relative py-24">
      <div className="mx-auto max-w-content px-6">
        <motion.header
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-16 max-w-2xl"
        >
          <motion.p variants={reveal} className="label-mono mb-4">
            Capítulo 02 — O caminho da foto
          </motion.p>
          <motion.h2
            variants={reveal}
            className="font-display text-display-sm font-extrabold uppercase text-white"
          >
            O que acontece<br />
            <span className="text-gradient-brand">com a sua imagem.</span>
          </motion.h2>
        </motion.header>

        <motion.div
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.title}
                variants={reveal}
                className={`surface group relative overflow-hidden p-6 transition-colors duration-300 hover:border-line-strong ${
                  step.highlight ? 'ring-1 ring-brand-violet/30' : ''
                }`}
              >
                <span className="label-mono text-slate-600">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <Icon
                  size={22}
                  aria-hidden="true"
                  className={`mt-6 ${step.highlight ? 'text-brand-violet' : 'text-slate-400'}`}
                />

                <h3 className="mt-4 font-display text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.body}</p>

                {step.highlight && (
                  <span className="mt-4 inline-block rounded-full bg-brand-violet/10 px-3 py-1 label-mono text-brand-violet">
                    Privacidade
                  </span>
                )}
              </motion.article>
            );
          })}
        </motion.div>

        <motion.aside
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="surface mt-4 flex items-start gap-4 p-6"
        >
          <Sparkles size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-ember" />
          <p className="text-sm leading-relaxed text-slate-400">
            <span className="font-bold text-white">A foto não fica guardada.</span>{' '}
            Ela é processada em memória, enviada ao modelo e descartada no fim
            da requisição. Não há banco de dados, nem galeria, nem histórico.
          </p>
        </motion.aside>
      </div>
    </section>
  );
}

export default HowItWorks;
