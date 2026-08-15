"""Integração com a API do Google Gemini.

Usa o SDK `google-genai` (o antecessor `google-generativeai` está descontinuado
e parou na versão 0.8.5). Ganhos relevantes da migração:

* cliente assíncrono nativo, então a chamada de rede não bloqueia o event loop
  do FastAPI enquanto o modelo responde;
* `response_schema`, que faz o próprio serviço garantir JSON no formato
  esperado — antes o backend fazia `json.loads` cru na resposta e quebrava com
  qualquer texto fora do padrão;
* `system_instruction` separada do conteúdo do usuário;
* timeout configurável por requisição.
"""

from __future__ import annotations

import logging
from functools import lru_cache

from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from pydantic import ValidationError

from .config import Settings, get_settings
from .prompt import SYSTEM_INSTRUCTION, USER_INSTRUCTION
from .schemas import AnalysisResult

logger = logging.getLogger(__name__)


class AIUnavailableError(Exception):
    """O serviço de IA não pôde ser alcançado ou falhou temporariamente."""


class AIConfigurationError(Exception):
    """A credencial de acesso ao serviço de IA está ausente ou é inválida."""


class AIResponseError(Exception):
    """O modelo respondeu, mas fora do contrato esperado."""


class ContentBlockedError(Exception):
    """A imagem foi barrada pelos filtros de segurança do modelo."""


@lru_cache(maxsize=1)
def get_client() -> genai.Client:
    """Cria (uma única vez) o cliente do Gemini.

    Raises:
        AIConfigurationError: Se `GOOGLE_API_KEY` não estiver definida.
    """
    settings = get_settings()
    if not settings.is_configured:
        raise AIConfigurationError(
            "GOOGLE_API_KEY não configurada. Defina-a no arquivo .env."
        )

    return genai.Client(
        api_key=settings.api_key,
        http_options=types.HttpOptions(
            timeout=settings.request_timeout_seconds * 1000,  # milissegundos
        ),
    )


def _build_config(settings: Settings) -> types.GenerateContentConfig:
    """Monta a configuração de geração, fixando o schema da resposta."""
    return types.GenerateContentConfig(
        system_instruction=SYSTEM_INSTRUCTION,
        temperature=1.0,
        top_p=0.95,
        max_output_tokens=1024,
        response_mime_type="application/json",
        response_schema=AnalysisResult,
        safety_settings=[
            types.SafetySetting(
                category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold=types.HarmBlockThreshold.BLOCK_ONLY_HIGH,
            ),
            types.SafetySetting(
                category=types.HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold=types.HarmBlockThreshold.BLOCK_ONLY_HIGH,
            ),
        ],
    )


def _extract_result(response: types.GenerateContentResponse) -> AnalysisResult:
    """Converte a resposta bruta do SDK em um `AnalysisResult` validado.

    Raises:
        ContentBlockedError: Se a requisição foi bloqueada por filtro.
        AIResponseError: Se a resposta veio vazia ou fora do schema.
    """
    feedback = getattr(response, "prompt_feedback", None)
    if feedback is not None and getattr(feedback, "block_reason", None):
        raise ContentBlockedError(
            "A imagem foi bloqueada pelos filtros de segurança da IA."
        )

    # O SDK já devolve o objeto tipado quando `response_schema` é usado.
    parsed = getattr(response, "parsed", None)
    if isinstance(parsed, AnalysisResult):
        return parsed
    if isinstance(parsed, dict):
        try:
            return AnalysisResult.model_validate(parsed)
        except ValidationError as exc:
            raise AIResponseError("Resposta da IA fora do formato esperado.") from exc

    # Caminho de contingência: o texto ainda é JSON válido segundo o schema.
    text = getattr(response, "text", None)
    if not text or not text.strip():
        raise AIResponseError("A IA retornou uma resposta vazia.")

    try:
        return AnalysisResult.model_validate_json(text)
    except ValidationError as exc:
        logger.warning("Resposta fora do schema: %s", text[:200])
        raise AIResponseError("Resposta da IA fora do formato esperado.") from exc


async def analyze_image(image_bytes: bytes, mime_type: str) -> AnalysisResult:
    """Envia a imagem ao Gemini e devolve a classificação de raridade.

    Args:
        image_bytes: Imagem já normalizada.
        mime_type: Tipo MIME correspondente aos bytes.

    Returns:
        A classificação validada.

    Raises:
        AIConfigurationError: Credencial ausente ou rejeitada.
        AIUnavailableError: Falha de rede ou indisponibilidade do serviço.
        ContentBlockedError: Conteúdo barrado por filtro de segurança.
        AIResponseError: Resposta fora do contrato.
    """
    settings = get_settings()
    client = get_client()

    contents = [
        types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
        types.Part.from_text(text=USER_INSTRUCTION),
    ]

    try:
        response = await client.aio.models.generate_content(
            model=settings.model_name,
            contents=contents,
            config=_build_config(settings),
        )
    except genai_errors.ClientError as exc:
        # 4xx vindos do Google: chave inválida, cota estourada, payload ruim.
        if exc.code in (401, 403):
            raise AIConfigurationError(
                "Credencial da API do Google rejeitada."
            ) from exc
        if exc.code == 429:
            raise AIUnavailableError(
                "Cota da API do Google excedida. Tente novamente em instantes."
            ) from exc
        logger.error("Erro de cliente na API do Gemini (%s): %s", exc.code, exc)
        raise AIUnavailableError("A IA recusou a requisição.") from exc
    except genai_errors.ServerError as exc:
        logger.error("Erro de servidor na API do Gemini: %s", exc)
        raise AIUnavailableError("O serviço de IA está indisponível.") from exc
    except (TimeoutError, genai_errors.APIError) as exc:
        logger.error("Falha ao contatar a API do Gemini: %s", exc)
        raise AIUnavailableError("Não foi possível contatar o serviço de IA.") from exc

    return _extract_result(response)
