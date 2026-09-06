"""Modelos de dados trocados pela API.

`AnalysisResult` é usado em duas frentes: como `response_schema` enviado ao
Gemini (garantindo JSON estruturado na origem) e como modelo de resposta do
FastAPI (garantindo que nada fora do contrato chegue ao cliente).
"""

from __future__ import annotations

import re
from enum import Enum

from pydantic import BaseModel, Field, ValidationInfo, field_validator

MAX_SCENE_LENGTH = 40
MAX_TITLE_LENGTH = 60
MAX_ANALYSIS_LENGTH = 320
MAX_COMMENT_LENGTH = 280


class RarityTier(str, Enum):
    """Tiers de raridade suportados, do mais comum ao mais raro."""

    COMMON = "TIER C"
    RARE = "TIER B"
    EPIC = "TIER A"
    LEGENDARY = "TIER SSS"

    @property
    def is_legendary(self) -> bool:
        return self is RarityTier.LEGENDARY


# Aceita variações que o modelo eventualmente produz ("SSS", "Tier-A", "c").
_TIER_ALIASES = {
    "C": RarityTier.COMMON,
    "B": RarityTier.RARE,
    "A": RarityTier.EPIC,
    "S": RarityTier.LEGENDARY,
    "SS": RarityTier.LEGENDARY,
    "SSS": RarityTier.LEGENDARY,
}


def normalize_tier(value: object) -> RarityTier:
    """Converte um valor arbitrário em um `RarityTier`.

    Args:
        value: Texto vindo do modelo, possivelmente fora do formato canônico.

    Returns:
        O tier correspondente, ou `RarityTier.COMMON` quando irreconhecível.
    """
    if isinstance(value, RarityTier):
        return value

    token = re.sub(r"[^A-Z]", "", str(value or "").upper())
    if token.startswith("TIER"):
        token = token[4:]
    return _TIER_ALIASES.get(token, RarityTier.COMMON)


# Teto de caracteres de cada campo textual, usado no truncamento tolerante.
_TEXT_LIMITS = {
    "scene": MAX_SCENE_LENGTH,
    "title": MAX_TITLE_LENGTH,
    "analysis": MAX_ANALYSIS_LENGTH,
    "comment": MAX_COMMENT_LENGTH,
}


class AnalysisResult(BaseModel):
    """Classificação de raridade produzida pela IA para uma imagem.

    A ordem dos campos é significativa: o Gemini gera o JSON na sequência
    declarada, então `scene` primeiro força a identificação do contexto antes
    do julgamento. Os três campos seguintes formam a estrutura de leitura
    da carta — abertura (`title`), análise técnica (`analysis`) e veredito
    (`comment`).
    """

    scene: str = Field(
        max_length=MAX_SCENE_LENGTH,
        description="Contexto identificado na foto, em até 3 palavras.",
    )
    rarity: RarityTier = Field(description="Tier de raridade atribuído à foto.")
    title: str = Field(
        max_length=MAX_TITLE_LENGTH,
        description="Título curto com temática de RPG.",
    )
    analysis: str = Field(
        max_length=MAX_ANALYSIS_LENGTH,
        description="Análise técnica da foto, no máximo duas frases.",
    )
    comment: str = Field(
        max_length=MAX_COMMENT_LENGTH,
        description="Veredito final, no máximo duas frases.",
    )

    @field_validator("rarity", mode="before")
    @classmethod
    def _coerce_rarity(cls, value: object) -> RarityTier:
        return normalize_tier(value)

    @field_validator("scene", "title", "analysis", "comment", mode="before")
    @classmethod
    def _clean_text(cls, value: object, info: ValidationInfo) -> str:
        """Normaliza espaços e trunca em vez de rejeitar respostas longas."""
        text = " ".join(str(value or "").split())
        return text[: _TEXT_LIMITS.get(info.field_name, MAX_COMMENT_LENGTH)]


class HealthResponse(BaseModel):
    """Resposta do endpoint de verificação de saúde."""

    status: str
    mode: str
    model: str
    ai_configured: bool


class ErrorResponse(BaseModel):
    """Formato uniforme para respostas de erro."""

    detail: str
