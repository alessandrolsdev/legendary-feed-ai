# 🎮 Legendary Feed AI

[![Python](https://img.shields.io/badge/Python-3.10+-3776ab?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.124-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)

Aplicação de análise de imagens com IA que classifica fotos em tiers de raridade inspirados em jogos RPG.

---

## 📋 Sobre o Projeto

O **Legendary Feed AI** utiliza a API do Google Gemini para analisar imagens enviadas pelo usuário e classificá-las em diferentes níveis de raridade, com uma personalidade única de engenheiro/gamer.

### Critérios de Classificação

| Tier | Raridade | Critérios |
|------|----------|-----------|
| **C** | Comum | Fotos tremidas, genéricas, selfies sem graça |
| **B** | Rara | Fotos bonitas, bem iluminadas, sorriso sincero |
| **A** | Épica | Setup de PC, código, igreja, instrumentos, café |
| **SSS** | Lendária | Capivaras, camisa anime/game, praia, inusitado |

---

## 🛠️ Tecnologias

### Backend
- **Python 3.10+** - Linguagem principal
- **FastAPI** - Framework web assíncrono
- **Google Gemini AI** - Modelo de IA generativa
- **Pillow** - Processamento de imagens
- **Uvicorn** - Servidor ASGI

### Frontend
- **React 19** - Biblioteca de UI
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **Framer Motion** - Animações
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

---

## 📦 Pré-requisitos

- [Python 3.10+](https://python.org/downloads)
- [Node.js 18+](https://nodejs.org)
- [Google AI API Key](https://aistudio.google.com/app/apikey)

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/legendary-feed-ai.git
cd legendary-feed-ai
```

### 2. Configure o Backend

```bash
cd backend

# Crie o ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt
```

### 3. Configure as Variáveis de Ambiente

Crie o arquivo `.env` na pasta `backend/`:

```env
GOOGLE_API_KEY=sua_api_key_do_google_aqui
```

### 4. Configure o Frontend

```bash
cd ../frontend

# Instale as dependências
npm install
```

---

## ▶️ Execução

### Iniciar o Backend

```bash
cd backend
python main.py
```

O servidor estará disponível em: `http://127.0.0.1:8000`

### Iniciar o Frontend

```bash
cd frontend
npm run dev
```

A aplicação estará disponível em: `http://localhost:5173`

---

## 🔌 Endpoints da API

### `GET /`

Verifica o status do servidor.

**Resposta:**
```json
{
  "status": "online",
  "mode": "engineer_active"
}
```

### `POST /analyze`

Analisa uma imagem e retorna a classificação de raridade.

**Request:**
- `Content-Type: multipart/form-data`
- `file`: Arquivo de imagem (JPG, PNG)

**Resposta:**
```json
{
  "rarity": "TIER A",
  "title": "Guerreiro do Código",
  "comment": "Setup bonito esse aí, dev! Faltou só o café pra ser perfeito."
}
```

---

## 📁 Estrutura do Projeto

```
legendary-feed-ai/
├── backend/
│   ├── main.py              # Servidor FastAPI + lógica de análise
│   ├── requirements.txt     # Dependências Python
│   └── .env                 # Variáveis de ambiente (não versionado)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Componente principal
│   │   ├── main.jsx         # Entry point
│   │   ├── index.css        # Estilos globais
│   │   └── App.css          # Estilos do componente
│   ├── package.json         # Dependências Node.js
│   ├── vite.config.js       # Configuração do Vite
│   └── tailwind.config.js   # Configuração do Tailwind
├── .gitignore
└── README.md
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

**Alessandro LS Dev**

---

<div align="center">
  <sub>Feito com 💜 e muita capivara 🦫</sub>
</div>
