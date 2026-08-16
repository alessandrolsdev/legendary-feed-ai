/**
 * @file App.jsx
 * @description Componente raiz do Legendary Feed AI. Orquestra o fluxo de
 * upload, análise e exibição do resultado; a lógica de estado vive em
 * `useImageAnalysis` e a apresentação nos componentes filhos.
 * @author Alessandro LS Dev
 */

import { Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import ErrorBanner from './components/ErrorBanner';
import ResultCard from './components/ResultCard';
import UploadPanel from './components/UploadPanel';
import { useImageAnalysis } from './hooks/useImageAnalysis';

/**
 * Interface principal da aplicação.
 *
 * @returns {JSX.Element}
 */
function App() {
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
  } = useImageAnalysis();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Efeitos de fundo, puramente decorativos. */}
      <div
        className="absolute inset-0 overflow-hidden -z-10 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wider mb-4">
          <Sparkles size={12} aria-hidden="true" />
          BETA ACCESS: MODE ENGINEER
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          LEGENDARY FEED
        </h1>
      </motion.header>

      <AnimatePresence>
        {error && <ErrorBanner key="error" message={error} onDismiss={dismissError} />}
      </AnimatePresence>

      <main className="w-full flex justify-center">
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
      </main>
    </div>
  );
}

export default App;
