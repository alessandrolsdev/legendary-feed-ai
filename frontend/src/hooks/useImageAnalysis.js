/**
 * @file useImageAnalysis.js
 * @description Hook que concentra o estado de seleção, validação e análise
 * da imagem, mantendo os componentes focados em apresentação.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { analyzeImage } from '../lib/api';
import { ACCEPTED_MIME_TYPES, MAX_FILE_BYTES } from '../lib/constants';

/**
 * Valida o arquivo antes de gastar uma requisição de rede.
 *
 * @param {File} file - Arquivo escolhido pelo usuário.
 * @returns {string|null} Mensagem de erro, ou `null` se estiver tudo certo.
 */
const validateFile = (file) => {
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return 'Formato não suportado. Escolha uma imagem JPG, PNG ou WEBP.';
  }
  if (file.size > MAX_FILE_BYTES) {
    const limitMb = Math.round(MAX_FILE_BYTES / (1024 * 1024));
    return `Imagem muito grande. O limite é de ${limitMb} MB.`;
  }
  return null;
};

/**
 * Gerencia o fluxo completo de análise de uma imagem.
 *
 * @returns {{
 *   selectedImage: File|null,
 *   preview: string|null,
 *   loading: boolean,
 *   result: object|null,
 *   error: string|null,
 *   selectFile: (file: File|null|undefined) => void,
 *   analyze: () => Promise<void>,
 *   reset: () => void,
 *   dismissError: () => void,
 * }}
 */
export const useImageAnalysis = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Guarda a URL ativa para que possa ser revogada mesmo fora do render.
  const previewUrlRef = useRef(null);
  const abortRef = useRef(null);

  /**
   * Substitui a URL de preview, liberando a anterior.
   *
   * Cada `URL.createObjectURL` prende o arquivo na memória do navegador até
   * ser revogado. A versão anterior nunca revogava, então analisar várias
   * fotos seguidas acumulava todas elas.
   *
   * @param {string|null} nextUrl - Nova URL, ou `null` para apenas liberar.
   */
  const swapPreviewUrl = useCallback((nextUrl) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = nextUrl;
    setPreview(nextUrl);
  }, []);

  // Libera a URL pendente e cancela a requisição ao desmontar.
  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      abortRef.current?.abort();
    },
    [],
  );

  const selectFile = useCallback(
    (file) => {
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setResult(null);
      setSelectedImage(file);
      swapPreviewUrl(URL.createObjectURL(file));
    },
    [swapPreviewUrl],
  );

  const analyze = useCallback(async () => {
    if (!selectedImage || loading) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeImage(selectedImage, controller.signal);
      if (!controller.signal.aborted) {
        setResult(data);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err.message);
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  }, [selectedImage, loading]);

  /**
   * Volta à tela inicial, limpando a imagem anterior.
   *
   * Antes, o botão "Tentar Outra" apenas apagava o resultado e mantinha a
   * foto já analisada carregada.
   */
  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setResult(null);
    setError(null);
    setSelectedImage(null);
    swapPreviewUrl(null);
  }, [swapPreviewUrl]);

  const dismissError = useCallback(() => setError(null), []);

  return {
    selectedImage,
    preview,
    loading,
    result,
    error,
    selectFile,
    analyze,
    reset,
    dismissError,
  };
};
