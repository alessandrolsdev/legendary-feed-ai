/**
 * @file ErrorBoundary.jsx
 * @description Captura erros de renderização para que uma falha em um
 * componente não deixe o usuário diante de uma tela em branco.
 */

import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Erro de renderização:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-black">Algo quebrou por aqui</h1>
        <p className="text-gray-400 max-w-sm text-sm">
          A interface encontrou um erro inesperado. Recarregue a página para
          tentar de novo.
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-sm"
        >
          Recarregar
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
