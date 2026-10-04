/**
 * @file AnalyzerSection.jsx
 * @description Capítulo final: a ferramenta em si.
 */

import { forwardRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import ErrorBanner from './ErrorBanner';
import ResultCard from './ResultCard';
import UploadPanel from './UploadPanel';
import { respectMotion, revealUp, staggerChildren, viewportOnce } from '../lib/motion';

/**
 * Seção que hospeda o fluxo de upload e resultado.
 *
 * @param {object} props
 * @param {ReturnType<import('../hooks/useImageAnalysis').useImageAnalysis>} props.analysis
 */
const AnalyzerSection = forwardRef(function AnalyzerSection({ analysis }, ref) {
  const reduce = useReducedMotion();
  const reveal = respectMotion(reduce, revealUp);

  const {
    selectedImage,
    preview,
    loading,
    result,
    error,
    selectFile,
    analyze,
    reset,
    dismissError,
  } = analysis;

  return (
    <section ref={ref} id="analisar" className="relative scroll-mt-16 py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-brand-violet/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-content px-6">
        <motion.header
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-12 text-center"
        >
          <motion.p variants={reveal} className="label-mono mb-4">
            Capítulo 03 — A sua vez
          </motion.p>
          <motion.h2
            variants={reveal}
            className="font-display text-display-sm font-extrabold uppercase text-white"
          >
            Manda a foto.
          </motion.h2>
          <motion.p variants={reveal} className="mx-auto mt-5 max-w-md text-pretty text-slate-400">
            Leva alguns segundos. O júri não costuma ser gentil, mas é justo.
          </motion.p>
        </motion.header>

        <div className="flex flex-col items-center">
          <AnimatePresence>
            {error && <ErrorBanner key="error" message={error} onDismiss={dismissError} />}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {result ? (
              <ResultCard
                key="result"
                result={result}
                preview={preview}
                file={selectedImage}
                onReset={reset}
              />
            ) : (
              <UploadPanel
                key="upload"
                preview={preview}
                loading={loading}
                hasImage={Boolean(selectedImage)}
                onSelectFile={selectFile}
                onAnalyze={analyze}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
});

export default AnalyzerSection;
