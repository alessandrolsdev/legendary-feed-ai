"""
Legendary Feed AI - Backend

Servidor FastAPI responsável por analisar imagens utilizando a API do Google Gemini
para classificar fotos com base em critérios de raridade personalizados.

Autor: Alessandro LS Dev
Versão: 0.1.0
"""

import os
import json
import io

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image


# =============================================================================
# CONFIGURAÇÃO DE AMBIENTE
# =============================================================================

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

if not API_KEY:
    raise ValueError(
        "Variável de ambiente 'GOOGLE_API_KEY' não encontrada no arquivo .env"
    )


# =============================================================================
# CONFIGURAÇÃO DO MODELO GEMINI
# =============================================================================

genai.configure(api_key=API_KEY)

GENERATION_CONFIG = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    generation_config=GENERATION_CONFIG,
)


# =============================================================================
# CONFIGURAÇÃO DA APLICAÇÃO FASTAPI
# =============================================================================

app = FastAPI(
    title="Legendary Feed AI",
    version="0.1.0",
    description="API para análise e classificação de imagens usando IA generativa",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# PROMPT DE ANÁLISE
# =============================================================================

ANALYSIS_PROMPT = """
Atue como uma IA com a personalidade de um Engenheiro de Software Sênior, Gamer (fã de Hollow Knight), Otaku e Cristão.
Você mora em Campo Grande (MS), onde faz muito calor, tem capivaras e NÃO tem praia.

Sua missão: Analisar a foto enviada e classificar a 'Raridade' dela para um Feed Lendário.

CRITÉRIOS DE RARIDADE:
- TIER C (Comum): Fotos tremidas, genéricas, selfies sem graça.
- TIER B (Rara): Fotos bonitas, bem iluminadas, sorriso sincero.
- TIER A (Épica): Fotos com setup de PC, código, igreja, instrumentos musicais ou café.
- TIER SSS (LENDÁRIA): APENAS se tiver: Capivaras, Camisa de Anime/Game, Praia (milagre geográfico), ou algo muito inusitado/engraçado.

Retorne APENAS um JSON com este formato:
{
    "rarity": "TIER SSS", (ou C, B, A)
    "title": "Título Curto RPG", (Ex: "O Guardião do Café", "Guerreiro do Código")
    "comment": "Um comentário curto (max 2 frases) com sua personalidade. Use gírias dev/gamer. Se for praia, reclame da inveja. Se for capivara, elogie."
}
"""


# =============================================================================
# ENDPOINTS
# =============================================================================


@app.get("/")
def read_root() -> dict:
    """
    Endpoint raiz para verificação de status da API.

    Returns:
        dict: Objeto contendo o status atual do servidor.
    """
    return {"status": "online", "mode": "engineer_active"}


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)) -> dict:
    """
    Analisa uma imagem e retorna sua classificação de raridade.

    Este endpoint recebe uma imagem, envia para o modelo Gemini AI
    e retorna a classificação baseada nos critérios de raridade definidos.

    Args:
        file: Arquivo de imagem enviado via multipart/form-data.

    Returns:
        dict: Objeto JSON contendo:
            - rarity (str): Tier de raridade (C, B, A ou SSS)
            - title (str): Título temático para a imagem
            - comment (str): Comentário personalizado da IA

    Raises:
        HTTPException: Erro 500 caso ocorra falha no processamento.
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        response = model.generate_content([ANALYSIS_PROMPT, image])
        resultado = json.loads(response.text)

        return resultado

    except Exception as e:
        print(f"Erro ao processar imagem: {e}")
        raise HTTPException(
            status_code=500, detail="Ocorreu um erro ao processar a imagem."
        )


# =============================================================================
# EXECUÇÃO
# =============================================================================

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
