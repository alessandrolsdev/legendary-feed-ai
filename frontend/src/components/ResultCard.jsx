/**
 * @file ResultCard.jsx
 * @description Carta de resultado: contexto detectado, tier, título,
 * análise técnica e veredito da IA.
 */

import { useState } from 'react';
import { Award, Check, RotateCcw, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

import RichText from './RichText';
import { getTier } from '../lib/tiers';
import { isLegendary } from '../lib/constants';
import { EASE_OUT } from '../lib/motion';
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

  const rarity = result?.rarity ?? 'TIER C';
  const tier = getTier(rarity);
  const legendary = isLegendary(rarity);
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

  const shareLabel = { idle: 'Compartilhar', copied: 'Copiado!', error: 'Não deu' }[shareState];

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.55, ease: EASE_OUT }}
      className="w-full max-w-md"
    >
      {/* A cor do tier define o brilho da carta: o lendário se anuncia. */}
      <div
        className="relative rounded-[1.75rem] p-px shadow-card"
        style={{
          backgroundImage: `linear-gradient(160deg, ${tier.glow}, rgb(255 255 255 / 0.06) 55%)`,
          boxShadow: legendary ? `0 0 70px -18px ${tier.glow}` : undefined,
        }}
      >
        <div className="overflow-hidden rounded-[1.7rem] bg-ink-soft">
          <div className="relative aspect-square overflow-hidden bg-ink-raised">
            {preview && (
              <img
                src={preview}
                className="h-full w-full object-cover"
                alt="Foto analisada pela IA"
              />
            )}

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink-soft via-ink-soft/20 to-transparent"
            />

            {scene && (
              <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 label-mono text-slate-200 backdrop-blur-md">
                <RichText>{scene}</RichText>
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 p-5">
              <span
                className={`mb-3 inline-block rounded-lg bg-gradient-to-r px-3 py-1 font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white ${tier.gradient}`}
              >
                {rarity}
              </span>
              <h3 className="font-display text-3xl font-extrabold uppercase leading-[0.95] text-white">
                <RichText>{title}</RichText>
              </h3>
            </div>
          </div>

          <div className="p-6">
            {analysis && (
              <>
                <p className="label-mono mb-2">Análise</p>
                <p className="text-sm leading-relaxed text-slate-400">
                  <RichText>{analysis}</RichText>
                </p>
                <hr className="my-5 border-line" />
              </>
            )}

            <p className="label-mono mb-2">Veredito</p>
            <p className="text-pretty text-base leading-relaxed text-slate-100">
              &ldquo;<RichText>{comment}</RichText>&rdquo;
            </p>

            {legendary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: EASE_OUT }}
                className="mt-5 flex items-center gap-3 rounded-2xl border border-tier-legendary/30 bg-tier-legendary/[0.07] p-4"
              >
                <Award className="shrink-0 text-tier-legendary" size={20} aria-hidden="true" />
                <div>
                  <p className="label-mono text-tier-legendary">Lendário detectado</p>
                  <p className="mt-0.5 text-xs text-amber-200/60">
                    Você pode entrar no Hall da Fama.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onReset}
                className="flex items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-bold text-slate-400 transition-colors hover:border-line-strong hover:text-white"
              >
                <RotateCcw size={15} aria-hidden="true" /> Outra foto
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-black transition-colors hover:bg-slate-200"
              >
                {shareState === 'copied' ? (
                  <Check size={15} aria-hidden="true" />
                ) : (
                  <Share2 size={15} aria-hidden="true" />
                )}
                {shareLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ResultCard;
