"""Aplicação FastAPI do Legendary Feed AI.

Expõe a análise de raridade de imagens, traduzindo cada falha possível do
pipeline (upload, decodificação, chamada ao modelo) em um código HTTP
apropriado em vez de agrupar tudo em um 500 genérico.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from .config import Settings, get_settings
from .gemini import (
    AIConfigurationError,
    AIResponseError,
    AIUnavailableError,
    ContentBlockedError,
    analyze_image,
)
from .images import (
    ImageTooLargeError,
    InvalidImageError,
    normalize_image,
    read_upload,
)
from .rate_limit import SlidingWindowRateLimiter
from .schemas import AnalysisResult, ErrorResponse, HealthResponse

logger = logging.getLogger(__name__)

_settings = get_settings()

logging.basicConfig(
    level=getattr(logging, _settings.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
)

# Backstop do Pillow contra decompression bombs, além da checagem explícita
# feita em `images.normalize_image`.
Image.MAX_IMAGE_PIXELS = _settings.max_image_pixels

rate_limiter = SlidingWindowRateLimiter(
    max_requests=_settings.rate_limit_requests,
    window_seconds=_settings.rate_limit_window_seconds,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Avisa na inicialização se o serviço subiu sem credencial de IA."""
    settings = get_settings()
    if not settings.is_configured:
        logger.warning(
            "GOOGLE_API_KEY ausente: /analyze responderá 503 até que "
            "a variável seja definida no arquivo .env."
        )
    else:
        logger.info("Modelo configurado: %s", settings.model_name)
    yield


app = FastAPI(
    title="Legendary Feed AI",
    version="1.0.0",
    description="API para análise e classificação de imagens usando IA generativa.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    # Allowlist explícita. A combinação anterior (`allow_origins=["*"]` com
    # `allow_credentials=True`) é inválida pela especificação de CORS: o
    # navegador recusa o wildcard quando credenciais são permitidas.
    allow_origins=_settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def _client_key(request: Request) -> str:
    """Identifica o chamador para fins de rate limiting."""
    return request.client.host if request.client else "desconhecido"


async def enforce_rate_limit(request: Request) -> None:
    """Dependência que barra chamadores acima da cota.

    Raises:
        HTTPException: 429 quando o limite da janela foi atingido.
    """
    allowed, retry_after = rate_limiter.check(_client_key(request))
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Muitas requisições. Aguarde um instante e tente novamente.",
            headers={"Retry-After": str(retry_after)},
        )


@app.get("/", response_model=HealthResponse, tags=["status"])
def read_root(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Retorna o estado atual do servidor."""
    return HealthResponse(
        status="online",
        mode="engineer_active",
        model=settings.model_name,
        ai_configured=settings.is_configured,
    )


@app.get("/health", response_model=HealthResponse, tags=["status"])
def health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Alias de `/` para uso em health checks de infraestrutura."""
    return read_root(settings)


@app.post(
    "/analyze",
    response_model=AnalysisResult,
    dependencies=[Depends(enforce_rate_limit)],
    responses={
        400: {"model": ErrorResponse, "description": "Imagem inválida"},
        413: {"model": ErrorResponse, "description": "Imagem grande demais"},
        422: {"model": ErrorResponse, "description": "Conteúdo bloqueado"},
        429: {"model": ErrorResponse, "description": "Limite de requisições"},
        502: {"model": ErrorResponse, "description": "Resposta inválida da IA"},
        503: {"model": ErrorResponse, "description": "IA indisponível"},
    },
    tags=["analise"],
)
async def analyze(
    file: UploadFile = File(..., description="Imagem JPG, PNG ou WEBP."),
    settings: Settings = Depends(get_settings),
) -> AnalysisResult:
    """Analisa uma imagem e retorna sua classificação de raridade.

    Args:
        file: Imagem enviada via `multipart/form-data`.
        settings: Configuração da aplicação.

    Returns:
        A classificação com tier, título e comentário.

    Raises:
        HTTPException: Com o código correspondente à falha ocorrida.
    """
    if not settings.is_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço de IA não configurado no servidor.",
        )

    try:
        raw = await read_upload(file, settings.max_upload_bytes)
    except ImageTooLargeError as exc:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=str(exc),
        ) from exc
    except InvalidImageError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc

    try:
        image_bytes, mime_type = normalize_image(
            raw,
            max_pixels=settings.max_image_pixels,
            max_dimension=settings.max_image_dimension,
        )
    except InvalidImageError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc

    try:
        return await analyze_image(image_bytes, mime_type)
    except ContentBlockedError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(exc)
        ) from exc
    except AIConfigurationError as exc:
        # A mensagem detalhada fica no log; o cliente não precisa saber que o
        # problema é de credencial.
        logger.error("Falha de configuração da IA: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço de IA indisponível no momento.",
        ) from exc
    except AIUnavailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)
        ) from exc
    except AIResponseError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)
        ) from exc
