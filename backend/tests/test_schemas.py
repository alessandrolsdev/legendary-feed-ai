"""Testes de normalização do contrato de resposta da IA."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.schemas import MAX_TITLE_LENGTH, AnalysisResult, RarityTier, normalize_tier


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("TIER SSS", RarityTier.LEGENDARY),
        ("tier sss", RarityTier.LEGENDARY),
        ("SSS", RarityTier.LEGENDARY),
        ("Tier-A", RarityTier.EPIC),
        ("  b  ", RarityTier.RARE),
        ("TIER C", RarityTier.COMMON),
        # Valores irreconhecíveis não podem derrubar a resposta.
        ("banana", RarityTier.COMMON),
        (None, RarityTier.COMMON),
        (42, RarityTier.COMMON),
    ],
)
def test_normalize_tier(raw, expected):
    assert normalize_tier(raw) is expected


def test_titulo_longo_e_truncado_no_limite_do_campo():
    result = AnalysisResult(rarity="A", title="x" * 500, comment="ok")

    assert len(result.title) == MAX_TITLE_LENGTH


def test_espacos_sao_normalizados():
    result = AnalysisResult(
        rarity="B", title="  O   Guardião \n do Café ", comment=" tudo   certo "
    )

    assert result.title == "O Guardião do Café"
    assert result.comment == "tudo certo"


def test_is_legendary():
    assert RarityTier.LEGENDARY.is_legendary
    assert not RarityTier.EPIC.is_legendary


def test_campos_ausentes_sao_rejeitados():
    with pytest.raises(ValidationError):
        AnalysisResult(rarity="A")
