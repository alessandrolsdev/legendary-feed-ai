"""Fixtures compartilhadas.

As variáveis de ambiente são definidas antes de qualquer import de `app`,
porque `app.main` resolve as configurações no momento da importação.
"""

from __future__ import annotations

import io
import os

os.environ.setdefault("GOOGLE_API_KEY", "chave-de-teste")
os.environ.setdefault("RATE_LIMIT_REQUESTS", "1000")
os.environ.setdefault("MAX_UPLOAD_BYTES", str(2 * 1024 * 1024))
os.environ.setdefault("LOG_LEVEL", "WARNING")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from PIL import Image  # noqa: E402

from app.main import app, rate_limiter  # noqa: E402
from app.schemas import AnalysisResult, RarityTier  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    """Cliente HTTP de testes com o rate limiter zerado."""
    rate_limiter.reset()
    with TestClient(app) as test_client:
        yield test_client
    rate_limiter.reset()


def make_image(
    *,
    size: tuple[int, int] = (64, 64),
    fmt: str = "PNG",
    color: str = "purple",
    mode: str = "RGB",
) -> bytes:
    """Gera os bytes de uma imagem sintética para uso nos testes."""
    buffer = io.BytesIO()
    Image.new(mode, size, color).save(buffer, format=fmt)
    return buffer.getvalue()


@pytest.fixture
def sample_image() -> bytes:
    return make_image()


@pytest.fixture
def fake_result() -> AnalysisResult:
    return AnalysisResult(
        rarity=RarityTier.EPIC,
        title="Guerreiro do Código",
        comment="Setup afiado, dev. Faltou o café.",
    )
