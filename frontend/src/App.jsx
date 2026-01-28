/**
 * @file App.jsx
 * @description Componente principal da aplicação Legendary Feed AI.
 * Interface para upload e análise de imagens com classificação de raridade via IA.
 * @author Alessandro LS Dev
 * @version 0.1.0
 */

import { useState } from 'react';
import { Upload, Camera, Sparkles, Zap, Share2, Award, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

/** URL base do servidor backend */
const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Mapeamento de cores gradientes por tier de raridade.
 * Utilizado para estilização dinâmica dos badges e cards.
 */
const RARITY_COLORS = {
  'TIER SSS': 'from-yellow-400 via-orange-500 to-yellow-600',
  'TIER A': 'from-purple-500 to-indigo-600',
  'TIER B': 'from-blue-400 to-cyan-500',
  default: 'from-gray-500 to-gray-700',
};

/**
 * Retorna a classe CSS de gradiente baseada no tier de raridade.
 *
 * @param {string} tier - Tier de raridade (TIER SSS, TIER A, TIER B, TIER C)
 * @returns {string} Classes Tailwind para gradiente de cores
 */
const getRarityColor = (tier) => {
  return RARITY_COLORS[tier] || RARITY_COLORS.default;
};

/**
 * Componente principal da aplicação.
 * Gerencia o fluxo de upload, análise e exibição de resultados.
 *
 * @returns {JSX.Element} Interface completa da aplicação
 */
function App() {
  /** @type {[File|null, Function]} Arquivo de imagem selecionado */
  const [selectedImage, setSelectedImage] = useState(null);

  /** @type {[string|null, Function]} URL de preview da imagem */
  const [preview, setPreview] = useState(null);

  /** @type {[boolean, Function]} Estado de carregamento durante análise */
  const [loading, setLoading] = useState(false);

  /** @type {[Object|null, Function]} Resultado da análise da IA */
  const [result, setResult] = useState(null);

  /**
   * Manipula a seleção de arquivo de imagem.
   * Cria URL de preview e limpa resultado anterior.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de mudança do input
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  /**
   * Envia a imagem para análise no backend.
   * Realiza requisição POST com FormData para o endpoint /analyze.
   *
   * @async
   */
  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data);
    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      alert('Erro ao conectar com a IA. Verifique se o servidor Python está rodando.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reseta o estado para permitir nova análise.
   */
  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 selection:bg-purple-500 selection:text-white relative overflow-hidden">

      {/* Efeitos de Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wider mb-4">
          <Sparkles size={12} />
          BETA ACCESS: MODE ENGINEER
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          LEGENDARY FEED
        </h1>
      </motion.div>

      {/* Área Principal de Conteúdo */}
      <AnimatePresence mode='wait'>
        {!result ? (
          /* Tela de Upload */
          <motion.div
            key="upload"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 shadow-2xl relative z-10"
          >
            <div className="relative group cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
              />

              <div className={`aspect-[4/5] rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden
                ${preview ? 'border-purple-500/50 bg-gray-900' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/50'}`}
              >
                {preview ? (
                  <img src={preview} alt="Preview da imagem" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Camera className="text-gray-400" size={32} />
                    </div>
                    <p className="text-gray-300 font-medium">Toque para enviar foto</p>
                    <p className="text-gray-500 text-xs mt-1">JPG, PNG</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!selectedImage || loading}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                ${!selectedImage
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02]'
                }
              `}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Zap size={20} fill="currentColor" />
                  AVALIAR AGORA
                </>
              )}
            </button>
          </motion.div>
        ) : (
          /* Tela de Resultado */
          <motion.div
            key="result"
            initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            className="w-full max-w-md perspective-1000 z-10"
          >
            <div className={`relative bg-gray-900 border-2 rounded-3xl overflow-hidden shadow-2xl p-1
              ${result.rarity.includes('SSS') ? 'border-yellow-500 shadow-yellow-500/50' : 'border-gray-700'}`}
            >

              {/* Imagem com Badge de Raridade */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-800">
                <img src={preview} className="w-full h-full object-cover opacity-80" alt="Imagem analisada" />

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent pt-10">
                  <div className={`inline-block px-3 py-1 rounded text-xs font-black tracking-widest mb-2 text-white bg-gradient-to-r ${getRarityColor(result.rarity)}`}>
                    {result.rarity}
                  </div>
                  <h2 className="text-2xl font-black text-white leading-tight">{result.title}</h2>
                </div>
              </div>

              {/* Comentário da IA */}
              <div className="p-6 bg-gray-900">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                    <span className="font-bold text-white text-xs">AI</span>
                  </div>
                  <div className="bg-gray-800 rounded-r-xl rounded-bl-xl p-3 text-sm text-gray-200 border border-gray-700">
                    <p>"{result.comment}"</p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={handleReset}
                    className="py-3 rounded-xl border border-gray-700 text-gray-400 font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={16} /> Tentar Outra
                  </button>
                  <button className="py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                    <Share2 size={16} /> Compartilhar
                  </button>
                </div>

                {/* Banner de Raridade Lendária */}
                {result.rarity.includes('SSS') && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-xl flex items-center gap-3"
                  >
                    <Award className="text-yellow-500 shrink-0" />
                    <div>
                      <p className="text-yellow-500 font-bold text-xs">LENDÁRIO DETECTADO</p>
                      <p className="text-yellow-200/70 text-xs">Você pode entrar no Hall da Fama.</p>
                    </div>
                  </motion.div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;