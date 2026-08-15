/**
 * @file ErrorBanner.jsx
 * @description Aviso de erro inline, no lugar do `alert()` bloqueante.
 */

import { AlertTriangle, X } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Exibe uma mensagem de erro dispensável.
 *
 * @param {object} props
 * @param {string} props.message - Texto do erro.
 * @param {() => void} props.onDismiss - Fecha o aviso.
 * @returns {JSX.Element}
 */
function ErrorBanner({ message, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      role="alert"
      aria-live="assertive"
      className="w-full max-w-md mb-4 z-10 flex items-start gap-3 p-3 rounded-xl bg-red-950/60 border border-red-500/40 backdrop-blur"
    >
      <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} aria-hidden="true" />
      <p className="text-sm text-red-100 flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fechar aviso"
        className="text-red-300 hover:text-white transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </motion.div>
  );
}

export default ErrorBanner;
