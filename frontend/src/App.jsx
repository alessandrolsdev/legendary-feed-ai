/**
 * @file App.jsx
 * @description Composição da página. A experiência é uma narrativa em
 * capítulos: abertura, critérios de julgamento, caminho da foto e, por fim,
 * a ferramenta.
 *
 * O estado do fluxo de análise vive em `useImageAnalysis` e é passado para a
 * seção que o consome, mantendo este arquivo como composição pura.
 * @author Alessandro LS Dev
 */

import { useCallback, useEffect, useRef } from 'react';

import AnalyzerSection from './components/AnalyzerSection';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import ScrollProgress from './components/ScrollProgress';
import SiteFooter from './components/SiteFooter';
import TierScrolly from './components/TierScrolly';
import { useImageAnalysis } from './hooks/useImageAnalysis';

/**
 * Página principal.
 *
 * @returns {JSX.Element}
 */
function App() {
  const analysis = useImageAnalysis();
  const analyzerRef = useRef(null);
  const { result } = analysis;

  const scrollToAnalyzer = useCallback(() => {
    analyzerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Quando o veredito chega, a carta pode estar fora da viewport — o usuário
  // rolou a página durante os segundos de espera. Trazemos o resultado à
  // vista em vez de deixá-lo aparecer sem ninguém olhando.
  useEffect(() => {
    if (!result) return;
    analyzerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [result]);

  return (
    <div className="relative min-h-screen bg-ink">
      <ScrollProgress />

      <a
        href="#analisar"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:font-bold focus:text-black"
      >
        Pular para o analisador
      </a>

      <main>
        <Hero onStart={scrollToAnalyzer} />
        <TierScrolly />
        <HowItWorks />
        <AnalyzerSection ref={analyzerRef} analysis={analysis} />
      </main>

      <SiteFooter />
    </div>
  );
}

export default App;
