"""Testes de normalização do contrato de resposta da IA."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.schemas import (
    MAX_ANALYSIS_LENGTH,
    MAX_SCENE_LENGTH,
    MAX_TITLE_LENGTH,
    AnalysisResult,
    RarityTier,
    normalize_tier,
)


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
    result = AnalysisResult(
        scene="Setup", rarity="A", title="x" * 500, analysis="ok", comment="ok"
    )

    assert len(result.title) == MAX_TITLE_LENGTH


def test_cada_campo_usa_o_proprio_limite():
    """Um limite compartilhado deixaria `scene` e `analysis` passarem batido."""
    result = AnalysisResult(
        scene="s" * 500,
        rarity="A",
        title="t" * 500,
        analysis="a" * 500,
        comment="c" * 500,
    )

    assert len(result.scene) == MAX_SCENE_LENGTH
    assert len(result.title) == MAX_TITLE_LENGTH
    assert len(result.analysis) == MAX_ANALYSIS_LENGTH


def test_ordem_dos_campos_guia_o_raciocinio_do_modelo():
    """`scene` precede `rarity`: o contexto é identificado antes do julgamento.

    O Gemini gera o JSON na ordem declarada no schema, então a ordem aqui é
    comportamento, não estética.
    """
    fields = list(AnalysisResult.model_fields)

    assert fields == ["scene", "rarity", "title", "analysis", "comment"]


def test_espacos_sao_normalizados():
    result = AnalysisResult(
        scene="  Café  ",
        rarity="B",
        title="  O   Guardião \n do Café ",
        analysis="  luz   quente ",
        comment=" tudo   certo ",
    )

    assert result.scene == "Café"
    assert result.title == "O Guardião do Café"
    assert result.analysis == "luz quente"
    assert result.comment == "tudo certo"


def test_is_legendary():
    assert RarityTier.LEGENDARY.is_legendary
    assert not RarityTier.EPIC.is_legendary


def test_campos_ausentes_sao_rejeitados():
    with pytest.raises(ValidationError):
        AnalysisResult(rarity="A")


def test_schema_enviado_ao_gemini_cobre_todos_os_campos():
    """O `response_schema` precisa exigir os cinco campos do contrato."""
    schema = AnalysisResult.model_json_schema()

    assert set(schema["required"]) == {
        "scene",
        "rarity",
        "title",
        "analysis",
        "comment",
    }
