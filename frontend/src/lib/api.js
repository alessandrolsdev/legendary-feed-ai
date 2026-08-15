/**
 * @file api.js
 * @description Cliente HTTP do backend, com mensagens de erro legíveis.
 */

import axios from 'axios';

/**
 * URL base do backend.
 *
 * Vem de `VITE_API_URL` para que o build de produção aponte para o servidor
 * real. Antes o endereço `http://127.0.0.1:8000` estava fixo no código, então
 * a aplicação publicada tentava falar com a máquina de quem a acessava.
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'
).replace(/\/$/, '');

/** Tempo máximo de espera por uma análise, em milissegundos. */
const REQUEST_TIMEOUT_MS = 60_000;

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

/** Mensagens amigáveis por código de status devolvido pelo backend. */
const STATUS_MESSAGES = {
  400: 'Esse arquivo não parece ser uma imagem válida. Tente outra foto.',
  413: 'Imagem muito grande. Envie um arquivo de até 8 MB.',
  415: 'Formato de imagem não suportado. Use JPG, PNG ou WEBP.',
  422: 'A IA não conseguiu avaliar essa imagem. Tente outra foto.',
  429: 'Calma, guerreiro! Muitas análises seguidas. Aguarde alguns segundos.',
  500: 'O servidor tropeçou. Tente novamente em instantes.',
  502: 'A IA respondeu de forma inesperada. Tente novamente.',
  503: 'A IA está indisponível no momento. Tente novamente em instantes.',
};

/**
 * Erro de aplicação com mensagem pronta para exibição.
 */
export class ApiError extends Error {
  /**
   * @param {string} message - Texto exibido ao usuário.
   * @param {number} [status] - Código HTTP, quando houver.
   */
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Traduz uma falha do axios em `ApiError`.
 *
 * @param {unknown} error - Erro capturado.
 * @returns {ApiError}
 */
const toApiError = (error) => {
  if (axios.isCancel(error)) {
    return new ApiError('Análise cancelada.');
  }

  if (error?.code === 'ECONNABORTED') {
    return new ApiError('A análise demorou demais. Tente novamente.');
  }

  const status = error?.response?.status;

  if (!status) {
    return new ApiError(
      'Não foi possível falar com o servidor. Verifique se o backend está rodando.',
    );
  }

  // O backend manda `detail` legível; usamos como preferência.
  const detail = error?.response?.data?.detail;
  const message =
    (typeof detail === 'string' && detail) ||
    STATUS_MESSAGES[status] ||
    'Algo deu errado na análise. Tente novamente.';

  return new ApiError(message, status);
};

/**
 * Envia a imagem para análise.
 *
 * @param {File} file - Arquivo de imagem selecionado.
 * @param {AbortSignal} [signal] - Permite cancelar a requisição.
 * @returns {Promise<{rarity: string, title: string, comment: string}>}
 * @throws {ApiError} Com mensagem pronta para exibição.
 */
export const analyzeImage = async (file, signal) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Sem `Content-Type` manual: o axios o remove para FormData no navegador,
    // que então o define junto com o boundary correto do multipart.
    const { data } = await http.post('/analyze', formData, { signal });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};
