import os
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image
import io


# 1. Carrega os segredos
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

if not API_KEY:
    raise ValueError("⚠️ ERRO: API Key do Google não encontrada no arquivo .env!")

# 2. Configura a IA
genai.configure(api_key=API_KEY)

# Configuração do Modelo (Usando o Flash para ser rápido)
generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 64,
  "max_output_tokens": 8192,
  "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
  model_name="gemini-2.5-flash",
  generation_config=generation_config,
)

app = FastAPI(title="Legendary Feed AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite qualquer origem (Frontend) acessar. Em produção, coloque a URL exata.
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos (GET, POST, etc)
    allow_headers=["*"],  # Permite todos os cabeçalhos
)


@app.get("/")
def read_root():
    return {"status": "online", "mode": "engineer_active"}

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        # Lê a imagem em memória
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # --- O PROMPT DO ENGENHEIRO (A ALMA DO NEGÓCIO) ---
        prompt = """
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

        # Envia para o Gemini
        response = model.generate_content([prompt, image])
        
        # Converte a resposta de texto para JSON Python
        resultado = json.loads(response.text)
        
        return resultado

    except Exception as e:
        print(f"Erro: {e}")
        raise HTTPException(status_code=500, detail="Ocorreu um erro ao processar a imagem.")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)