/**
 * @file UploadPanel.jsx
 * @description Tela de seleção e envio da imagem.
 */

import { useId, useRef, useState } from 'react';
import { Camera, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

import { ACCEPTED_MIME_TYPES } from '../lib/constants';
import { EASE_OUT } from '../lib/motion';

/**
 * Painel de upload com suporte a clique, teclado e arrastar-e-soltar.
 *
 * @param {object} props
 * @param {string|null} props.preview - URL de pré-visualização da imagem.
 * @param {boolean} props.loading - Indica análise em andamento.
 * @param {boolean} props.hasImage - Indica se há imagem selecionada.
 * @param {(file: File) => void} props.onSelectFile - Recebe o arquivo escolhido.
 * @param {() => void} props.onAnalyze - Dispara a análise.
 * @returns {JSX.Element}
 */
function UploadPanel({ preview, loading, hasImage, onSelectFile, onAnalyze }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (file) onSelectFile(file);
    // Permite reescolher o mesmo arquivo logo em seguida.
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onSelectFile(file);
  };

  return (
    <motion.div
      key="upload"
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.96, opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="surface w-full max-w-md p-5 shadow-card"
    >
      {/* O input fica visualmente oculto, mas continua acessível a leitores
          de tela e à navegação por teclado através do label. */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_MIME_TYPES.join(',')}
        onChange={handleChange}
        className="sr-only"
      />

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`group relative block aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl border border-dashed transition-all duration-300 ease-out
          focus-within:ring-2 focus-within:ring-brand-violet focus-within:ring-offset-2 focus-within:ring-offset-ink
          ${
            isDragging
              ? 'border-brand-violet bg-brand-violet/10'
              : preview
                ? 'border-brand-violet/40 bg-ink-raised'
                : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
          }`}
      >
        {preview ? (
          <img
            src={preview}
            alt="Pré-visualização da foto selecionada"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-ink-raised transition-transform duration-300 ease-out group-hover:scale-110">
              <Camera className="text-slate-400" size={28} aria-hidden="true" />
            </div>
            <p className="font-display text-lg font-bold text-white">Solte a foto aqui</p>
            <p className="mt-1 text-sm text-slate-500">ou toque para escolher</p>
            <p className="label-mono mt-4 text-slate-600">JPG · PNG · WEBP — até 8 MB</p>
          </div>
        )}
      </label>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={!hasImage || loading}
        className={`mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 font-display text-base font-bold uppercase tracking-wide transition-all duration-300 ease-out
          ${
            !hasImage || loading
              ? 'cursor-not-allowed bg-white/5 text-slate-600'
              : 'bg-gradient-to-r from-brand-violet to-brand-pink text-white hover:scale-[1.02] hover:shadow-glow hover:shadow-brand-violet/40'
          }`}
      >
        {loading ? (
          <>
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white"
              aria-hidden="true"
            />
            Processando...
          </>
        ) : (
          <>
            <Zap size={18} fill="currentColor" aria-hidden="true" />
            Avaliar agora
          </>
        )}
      </button>
    </motion.div>
  );
}

export default UploadPanel;
