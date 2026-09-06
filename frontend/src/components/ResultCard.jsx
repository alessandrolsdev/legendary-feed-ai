/**
 * @file ResultCard.jsx
 * @description Carta de resultado: contexto detectado, tier, título,
 * análise técnica e veredito da IA.
 */

import { useState } from 'react';
import { Award, Check, Share2, X } from 'lucide-react';
import { motion } from 'framer-motion';

import RichText from './RichText';
import { getRarityColor, isLegendary } from '../lib/constants';
import { toPlainText } from '../lib/markdown';

/**
 * Monta o texto compartilhável do resultado, sem marcação.
 *
 * @param {{rarity: string, title: string, comment: string}} result
 * @returns {string}
 */
const buildShareText = ({ rarity, title, comment }) =>
  `${rarity} — ${toPlainText(title)}\n"${toPlainText(comment)}"\n\nAvaliado no Legendary Feed AI.`;

/**
 * Exibe o resultado da análise.
 *
 * Todos os campos são acessados de forma tolerante: se a API devolver um
 * objeto incompleto, a tela degrada em vez de quebrar.
 *
 * @param {object} props
 * @param {{scene?: string, rarity?: string, title?: string, analysis?: string, comment?: string}} props.result
 * @param {string|null} props.preview - URL da imagem analisada.
 * @param {File|null} props.file - Arquivo original, usado no compartilhamento.
 * @param {() => void} props.onReset - Volta para a tela de upload.
 * @returns {JSX.Element}
 */
function ResultCard({ result, preview, file, onReset }) {
  const [shareState, setShareState] = useState('idle');

  const legendary = isLegendary(result?.rarity);
  const rarity = result?.rarity ?? 'TIER C';
  const title = result?.title ?? 'Sem título';
  const comment = result?.comment ?? '';
  const scene = result?.scene ?? '';
  const analysis = result?.analysis ?? '';

  /**
   * Compartilha o resultado via Web Share API, com fallback para a área de
   * transferência no desktop.
   */
  const handleShare = async () => {
    const text = buildShareText({ rarity, title, comment });

    try {
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'Legendary Feed AI', text, files: [file] });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: 'Legendary Feed AI', text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2000);
    } catch (error) {
      // O usuário cancelar a folha de compartilhamento não é uma falha.
      if (error?.name !== 'AbortError') {
        setShareState('error');
        setTimeout(() => setShareState('idle'), 2000);
      }
    }
  };

  const shareLabel = {
    idle: 'Compartilhar',
    copied: 'Copiado!',
    error: 'Não deu',
  }[shareState];

  return (
    <motion.div
      key="result"
      initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="w-full max-w-md z-10"
    >
      <div
        className={`relative bg-gray-900 border-2 rounded-3xl overflow-hidden shadow-2xl p-1
          ${legendary ? 'border-yellow-500 shadow-yellow-500/50' : 'border-gray-700'}`}
      >
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-800">
          {preview && (
            <img
              src={preview}
              className="w-full h-full object-cover opacity-80"
              alt="Foto analisada pela IA"
            />
          )}

          {scene && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider bg-black/60 text-gray-200 border border-white/15 backdrop-blur">
              <RichText>{scene}</RichText>
            </span>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent pt-10">
            <div
              className={`inline-block px-3 py-1 rounded text-xs font-black tracking-widest mb-2 text-white bg-gradient-to-r ${getRarityColor(rarity)}`}
            >
              {rarity}
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">
              <RichText>{title}</RichText>
            </h2>
          </div>
        </div>

        <div className="p-6 bg-gray-900">
          {analysis && (
            <p className="text-sm text-gray-400 leading-relaxed mb-4 pb-4 border-b border-gray-800">
              <RichText>{analysis}</RichText>
            </p>
          )}

          <div className="flex gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <span className="font-bold text-white text-xs">AI</span>
            </div>
            <div className="bg-gray-800 rounded-r-xl rounded-bl-xl p-3 text-sm text-gray-200 border border-gray-700">
              <p>
                &ldquo;<RichText>{comment}</RichText>&rdquo;
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={onReset}
              className="py-3 rounded-xl border border-gray-700 text-gray-400 font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <X size={16} aria-hidden="true" /> Tentar Outra
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {shareState === 'copied' ? (
                <Check size={16} aria-hidden="true" />
              ) : (
                <Share2 size={16} aria-hidden="true" />
              )}
              {shareLabel}
            </button>
          </div>

          {legendary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-xl flex items-center gap-3"
            >
              <Award className="text-yellow-500 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-yellow-500 font-bold text-xs">LENDÁRIO DETECTADO</p>
                <p className="text-yellow-200/70 text-xs">
                  Você pode entrar no Hall da Fama.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ResultCard;
