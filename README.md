# 🎮 Legendary Feed AI

[![CI](https://github.com/alessandrolsdev/legendary-feed-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/alessandrolsdev/legendary-feed-ai/actions/workflows/ci.yml)
[![Python](https://img.shields.io/badge/Python-3.10+-3776ab?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.124-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Gemini](https://img.shields.io/badge/Gemini-2.5-8E75B2?style=flat&logo=google&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat)](LICENSE)

Aplicação de análise de imagens com IA que classifica fotos em tiers de raridade
inspirados em jogos RPG.

---

## 📋 Sobre o Projeto

O **Legendary Feed AI** usa a API do Google Gemini para analisar imagens enviadas
pelo usuário e classificá-las em níveis de raridade, com a personalidade de um
engenheiro/gamer.

### Critérios de Classificação

| Tier | Raridade | Critérios |
|------|----------|-----------|
| **C** | Comum | Fotos tremidas, genéricas, selfies sem graça |
| **B** | Rara | Fotos bonitas, bem iluminadas, sorriso sincero |
| **A** | Épica | Setup de PC, código, igreja, instrumentos, café |
| **SSS** | Lendária | Capivaras, camisa anime/game, praia, inusitado |

---

## 🛡️ Como o upload é tratado

Toda imagem passa por um pipeline de validação antes de chegar ao modelo:

1. **Leitura limitada** — o arquivo é lido em blocos e abortado assim que
   ultrapassa `MAX_UPLOAD_BYTES`, sem carregar o upload inteiro na memória.
2. **Formato pelo conteúdo** — o tipo é decidido pelos bytes reais, não pelo
   nome do arquivo nem pelo `Content-Type` enviado pelo cliente.
3. **Proteção contra decompression bombs** — imagens que se expandem para além
   de `MAX_IMAGE_PIXELS` são rejeitadas antes da decodificação completa.
4. **Reamostragem e reencode** — a foto é reduzida a `MAX_IMAGE_DIMENSION` e
   convertida para JPEG, o que reduz o custo em tokens e **remove os metadados
   EXIF**, incluindo coordenadas de GPS, antes do envio a um serviço externo.
5. **Rate limiting por IP** — impede que a cota paga da API seja esgotada por
   um laço de requisições.

---

## 🛠️ Tecnologias

**Backend** — Python 3.10+, FastAPI, `google-genai`, Pillow, Uvicorn, pytest, ruff
**Frontend** — React 19, Vite, TailwindCSS, Framer Motion, Axios, Lucide React

---

## 📦 Pré-requisitos

- [Python 3.10+](https://python.org/downloads)
- [Node.js 18+](https://nodejs.org)
- [Google AI API Key](https://aistudio.google.com/app/apikey)

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/alessandrolsdev/legendary-feed-ai.git
cd legendary-feed-ai
```

### 2. Backend

```bash
cd backend

python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

cp .env.example .env   # e preencha GOOGLE_API_KEY
```

### 3. Frontend

```bash
cd ../frontend
npm install
cp .env.example .env   # opcional em desenvolvimento
```

---

## ▶️ Execução

```bash
# Terminal 1
cd backend && python main.py

# Terminal 2
cd frontend && npm run dev
```

- API: `http://127.0.0.1:8000` (documentação interativa em `/docs`)
- Aplicação: `http://localhost:5173`

---

## ⚙️ Variáveis de Ambiente

### `backend/.env`

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `GOOGLE_API_KEY` | — | **Obrigatória.** Chave da API do Google AI |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Modelo usado na análise |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Origens autorizadas (CORS) |
| `MAX_UPLOAD_BYTES` | `8388608` | Tamanho máximo do upload (8 MB) |
| `MAX_IMAGE_PIXELS` | `40000000` | Área máxima da imagem |
| `MAX_IMAGE_DIMENSION` | `1536` | Maior lado após a reamostragem |
| `REQUEST_TIMEOUT_SECONDS` | `45` | Tempo máximo de espera pelo modelo |
| `RATE_LIMIT_REQUESTS` | `20` | Requisições permitidas por janela |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | Duração da janela |
| `HOST` / `PORT` | `127.0.0.1` / `8000` | Endereço do servidor |
| `LOG_LEVEL` | `INFO` | Nível de log |

### `frontend/.env`

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `VITE_API_URL` | `http://127.0.0.1:8000` | URL do backend |

> Em produção, defina `VITE_API_URL` com o domínio real da API e inclua o
> domínio do frontend em `ALLOWED_ORIGINS`.

---

## 🔌 Endpoints da API

### `GET /` e `GET /health`

```json
{
  "status": "online",
  "mode": "engineer_active",
  "model": "gemini-2.5-flash",
  "ai_configured": true
}
```

### `POST /analyze`

**Request:** `multipart/form-data` com o campo `file` (JPG, PNG, WEBP, GIF ou BMP).

**Resposta `200`:**

```json
{
  "rarity": "TIER A",
  "title": "Guerreiro do Código",
  "comment": "Setup bonito esse aí, dev! Faltou só o café pra ser perfeito."
}
```

**Erros:**

| Código | Situação |
|--------|----------|
| `400` | Arquivo não é uma imagem válida ou o formato não é suportado |
| `413` | Imagem acima de `MAX_UPLOAD_BYTES` |
| `422` | Nenhum arquivo enviado, ou conteúdo bloqueado pelos filtros da IA |
| `429` | Limite de requisições atingido (traz o cabeçalho `Retry-After`) |
| `502` | A IA respondeu fora do formato esperado |
| `503` | IA indisponível ou `GOOGLE_API_KEY` não configurada |

---

## 🧪 Testes e Qualidade

```bash
# Backend
cd backend
pip install -r requirements-dev.txt
pytest          # a suíte usa um dublê do Gemini: nenhuma chave real é gasta
ruff check .

# Frontend
cd frontend
npm run lint
npm run build
```

O workflow em `.github/workflows/ci.yml` roda essas mesmas verificações a cada
push e pull request.

---

## 📁 Estrutura do Projeto

```
legendary-feed-ai/
├── backend/
│   ├── app/
│   │   ├── config.py         # Configuração via variáveis de ambiente
│   │   ├── gemini.py         # Integração com a API do Gemini
│   │   ├── images.py         # Validação e normalização do upload
│   │   ├── main.py           # Aplicação FastAPI e rotas
│   │   ├── prompt.py         # Instruções de sistema do modelo
│   │   ├── rate_limit.py     # Janela deslizante por IP
│   │   └── schemas.py        # Contrato de entrada e saída
│   ├── tests/                # Suíte pytest com o Gemini dublado
│   ├── main.py               # Ponto de entrada (python main.py)
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # UploadPanel, ResultCard, ErrorBanner…
│   │   ├── hooks/            # useImageAnalysis
│   │   ├── lib/              # Cliente HTTP e constantes
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env.example
├── .github/workflows/ci.yml
├── LICENSE
└── README.md
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE).

---

## 👤 Autor

**Alessandro LS Dev**

---

<div align="center">
  <sub>Feito com 💜 e muita capivara 🦫</sub>
</div>
