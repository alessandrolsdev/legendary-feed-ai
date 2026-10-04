/**
 * @file SiteFooter.jsx
 * @description Rodapé com crédito e links do projeto.
 */

import { Github } from 'lucide-react';

const REPO_URL = 'https://github.com/alessandrolsdev/legendary-feed-ai';

/**
 * Rodapé da página.
 *
 * @returns {JSX.Element}
 */
function SiteFooter() {
  return (
    <footer className="border-t border-line py-12">
      <div className="mx-auto flex max-w-content flex-col items-center gap-6 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-lg font-extrabold uppercase text-gradient-brand">
            Legendary Feed
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Feito com 💜 e muita capivara em Campo Grande (MS).
          </p>
        </div>

        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-bold text-slate-300 transition-colors hover:border-line-strong hover:text-white"
        >
          <Github size={16} aria-hidden="true" />
          Código no GitHub
        </a>
      </div>
    </footer>
  );
}

export default SiteFooter;
