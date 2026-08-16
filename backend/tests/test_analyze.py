"""Testes do endpoint `/analyze`.

A chamada ao Gemini é sempre substituída por um dublê: os testes verificam o
comportamento do servidor, não o do modelo.
"""

from __future__ import annotations

import io

import pytest
from PIL import Image

from app import main as main_module
from app.gemini import (
    AIConfigurationError,
    AIResponseError,
    AIUnavailableError,
    ContentBlockedError,
)
from tests.conftest import make_image


@pytest.fixture
def mock_ai(monkeypatch):
    """Substitui `analyze_image` por uma função controlada pelo teste."""

    def _install(result=None, error=None):
        async def fake_analyze(image_bytes: bytes, mime_type: str):
            fake_analyze.calls.append((image_bytes, mime_type))
            if error is not None:
                raise error
            return result

        fake_analyze.calls = []
        monkeypatch.setattr(main_module, "analyze_image", fake_analyze)
        return fake_analyze

    return _install


def post_image(client, data: bytes, filename: str = "foto.png", content_type: str = "image/png"):
    return client.post("/analyze", files={"file": (filename, data, content_type)})


# ---------------------------------------------------------------------------
# Caminho feliz
# ---------------------------------------------------------------------------


def test_analyze_retorna_classificacao(client, sample_image, fake_result, mock_ai):
    mock_ai(result=fake_result)

    response = post_image(client, sample_image)

    assert response.status_code == 200
    body = response.json()
    assert body == {
        "rarity": "TIER A",
        "title": "Guerreiro do Código",
        "comment": "Setup afiado, dev. Faltou o café.",
    }


def test_imagem_e_normalizada_para_jpeg(client, sample_image, fake_result, mock_ai):
    """O upload chega ao modelo como JPEG, independente do formato original."""
    fake = mock_ai(result=fake_result)

    post_image(client, sample_image)

    sent_bytes, mime_type = fake.calls[0]
    assert mime_type == "image/jpeg"
    with Image.open(io.BytesIO(sent_bytes)) as sent:
        assert sent.format == "JPEG"


def test_imagem_grande_e_reduzida(client, fake_result, mock_ai):
    """Fotos acima do limite de dimensão são reamostradas antes do envio."""
    fake = mock_ai(result=fake_result)
    large = make_image(size=(4000, 3000), fmt="JPEG")

    response = post_image(client, large, "grande.jpg", "image/jpeg")

    assert response.status_code == 200
    sent_bytes, _ = fake.calls[0]
    with Image.open(io.BytesIO(sent_bytes)) as sent:
        assert max(sent.size) <= 1536


def test_metadados_exif_sao_removidos(client, fake_result, mock_ai):
    """EXIF (que pode conter GPS) não é repassado ao serviço externo."""
    fake = mock_ai(result=fake_result)

    buffer = io.BytesIO()
    image = Image.new("RGB", (100, 100), "blue")
    exif = image.getexif()
    exif[0x010F] = "MarcaSensivel"  # Make
    exif[0x0110] = "ModeloSensivel"  # Model
    exif[0x0132] = "2024:01:01 12:00:00"  # DateTime
    image.save(buffer, format="JPEG", exif=exif)

    post_image(client, buffer.getvalue(), "com-exif.jpg", "image/jpeg")

    sent_bytes, _ = fake.calls[0]
    with Image.open(io.BytesIO(sent_bytes)) as sent:
        assert not dict(sent.getexif())


def test_png_transparente_vira_fundo_branco(client, fake_result, mock_ai):
    """Transparência é achatada sobre branco, não sobre preto."""
    fake = mock_ai(result=fake_result)
    transparent = make_image(mode="RGBA", color=(0, 0, 0, 0), fmt="PNG")

    response = post_image(client, transparent)

    assert response.status_code == 200
    sent_bytes, _ = fake.calls[0]
    with Image.open(io.BytesIO(sent_bytes)) as sent:
        assert sent.convert("RGB").getpixel((10, 10)) == (255, 255, 255)


# ---------------------------------------------------------------------------
# Validação de entrada
# ---------------------------------------------------------------------------


def test_arquivo_nao_imagem_retorna_400(client, mock_ai):
    """Antes, qualquer arquivo inválido virava um 500 genérico."""
    fake = mock_ai(result=None)

    response = post_image(client, b"isto nao e uma imagem", "malware.exe", "image/png")

    assert response.status_code == 400
    assert not fake.calls  # nada é enviado ao modelo


def test_arquivo_vazio_retorna_400(client, mock_ai):
    mock_ai(result=None)

    response = post_image(client, b"")

    assert response.status_code == 400


def test_upload_acima_do_limite_retorna_413(client, mock_ai):
    fake = mock_ai(result=None)
    # Ruído aleatório não comprime, então o arquivo passa dos 2 MB do teste.
    oversized = make_image(size=(2000, 2000), fmt="BMP")
    assert len(oversized) > 2 * 1024 * 1024

    response = post_image(client, oversized, "enorme.bmp", "image/bmp")

    assert response.status_code == 413
    assert not fake.calls


def test_formato_nao_suportado_retorna_400(client, mock_ai):
    """O formato é decidido pelo conteúdo real, não pelo Content-Type."""
    fake = mock_ai(result=None)
    tiff = make_image(fmt="TIFF")

    response = post_image(client, tiff, "foto.png", "image/png")

    assert response.status_code == 400
    assert not fake.calls


def test_requisicao_sem_arquivo_retorna_422(client):
    assert client.post("/analyze").status_code == 422


# ---------------------------------------------------------------------------
# Tradução de falhas da IA
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    ("error", "expected_status"),
    [
        (ContentBlockedError("bloqueado"), 422),
        (AIUnavailableError("fora do ar"), 503),
        (AIResponseError("json invalido"), 502),
        (AIConfigurationError("sem chave"), 503),
    ],
)
def test_falhas_da_ia_viram_status_especificos(
    client, sample_image, mock_ai, error, expected_status
):
    mock_ai(error=error)

    response = post_image(client, sample_image)

    assert response.status_code == expected_status
    assert "detail" in response.json()


def test_erro_de_credencial_nao_vaza_detalhe(client, sample_image, mock_ai):
    mock_ai(error=AIConfigurationError("Credencial da API do Google rejeitada."))

    detail = post_image(client, sample_image).json()["detail"]

    assert "Credencial" not in detail


# ---------------------------------------------------------------------------
# Rate limiting
# ---------------------------------------------------------------------------


def test_rate_limit_retorna_429(client, sample_image, fake_result, mock_ai, monkeypatch):
    mock_ai(result=fake_result)
    monkeypatch.setattr(main_module.rate_limiter, "_max_requests", 3)
    main_module.rate_limiter.reset()

    statuses = [post_image(client, sample_image).status_code for _ in range(5)]

    assert statuses[:3] == [200, 200, 200]
    assert statuses[3:] == [429, 429]


def test_resposta_429_traz_retry_after(client, sample_image, fake_result, mock_ai, monkeypatch):
    mock_ai(result=fake_result)
    monkeypatch.setattr(main_module.rate_limiter, "_max_requests", 1)
    main_module.rate_limiter.reset()

    post_image(client, sample_image)
    response = post_image(client, sample_image)

    assert response.status_code == 429
    assert int(response.headers["Retry-After"]) >= 1


# ---------------------------------------------------------------------------
# Configuração ausente
# ---------------------------------------------------------------------------


def test_sem_chave_configurada_retorna_503(client, sample_image, monkeypatch):
    from app.config import Settings

    monkeypatch.setattr(
        main_module, "get_settings", lambda: Settings(api_key=None), raising=True
    )
    client.app.dependency_overrides[main_module.get_settings] = lambda: Settings(
        api_key=None
    )
    try:
        response = post_image(client, sample_image)
    finally:
        client.app.dependency_overrides.clear()

    assert response.status_code == 503
