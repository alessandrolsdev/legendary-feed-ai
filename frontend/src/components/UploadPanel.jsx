/**
 * @file UploadPanel.jsx
 * @description Tela de seleção e envio da imagem.
 */

import { useId, useRef, useState } from 'react';
import { Camera, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

import { ACCEPTED_MIME_TYPES } from '../lib/constants';

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
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="w-full max-w-md bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 shadow-2xl relative z-10"
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
        className={`group block aspect-[4/5] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden
          focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-950
          ${
            isDragging
              ? 'border-purple-400 bg-purple-900/20'
              : preview
                ? 'border-purple-500/50 bg-gray-900'
                : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/50'
          }`}
      >
        {preview ? (
          <img
            src={preview}
            alt="Pré-visualização da foto selecionada"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Camera className="text-gray-400" size={32} aria-hidden="true" />
            </div>
            <p className="text-gray-300 font-medium">Toque para enviar foto</p>
            <p className="text-gray-500 text-xs mt-1">
              JPG, PNG ou WEBP — até 8 MB
            </p>
          </div>
        )}
      </label>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={!hasImage || loading}
        className={`w-full mt-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
          focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-950
          ${
            !hasImage || loading
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02]'
          }`}
      >
        {loading ? (
          <>
            <span
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
              aria-hidden="true"
            />
            Processando...
          </>
        ) : (
          <>
            <Zap size={20} fill="currentColor" aria-hidden="true" />
            AVALIAR AGORA
          </>
        )}
      </button>
    </motion.div>
  );
}

export default UploadPanel;
