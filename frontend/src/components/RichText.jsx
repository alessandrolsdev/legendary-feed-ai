/**
 * @file RichText.jsx
 * @description Renderiza a formatação inline que o modelo eventualmente
 * emite, para que marcadores de Markdown não apareçam crus na tela.
 */

import { Fragment } from 'react';

import { splitInlineMarkdown, stripBlockMarkers } from '../lib/markdown';

/**
 * Exibe um texto da IA com negrito, itálico e código renderizados.
 *
 * O prompt pede texto puro e o contrato entrega campos curtos, mas modelos
 * generativos escapam da instrução de vez em quando. Renderizar a ênfase é
 * preferível a exibir `**assim**` para o usuário.
 *
 * @param {object} props
 * @param {string} [props.children] - Texto bruto vindo da IA.
 * @returns {JSX.Element|null}
 */
function RichText({ children }) {
  const text = stripBlockMarkers(children ?? '');
  if (!text) return null;

  return (
    <>
      {splitInlineMarkdown(text).map((token, index) => {
        const key = `${index}-${token.value}`;

        switch (token.type) {
          case 'bold':
            return (
              <strong key={key} className="font-bold text-white">
                {token.value}
              </strong>
            );
          case 'italic':
            return (
              <em key={key} className="italic">
                {token.value}
              </em>
            );
          case 'code':
            return (
              <code
                key={key}
                className="px-1 py-0.5 rounded bg-gray-950/70 border border-gray-700 font-mono text-[0.85em]"
              >
                {token.value}
              </code>
            );
          default:
            return <Fragment key={key}>{token.value}</Fragment>;
        }
      })}
    </>
  );
}

export default RichText;
