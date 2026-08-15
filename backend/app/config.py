"""Configuração da aplicação, lida a partir de variáveis de ambiente.

As configurações são resolvidas de forma preguiçosa (`get_settings`) para que o
módulo possa ser importado em testes e ferramentas de CI sem uma chave de API
real. A ausência da chave é tratada em tempo de requisição, não de importação.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()

MIB = 1024 * 1024


def _env_int(name: str, default: int) -> int:
    """Lê um inteiro do ambiente, caindo para o padrão se ausente ou inválido."""
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _env_list(name: str, default: list[str]) -> list[str]:
    """Lê uma lista separada por vírgulas do ambiente."""
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    return [item.strip() for item in raw.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    """Parâmetros de execução do serviço."""

    api_key: str | None = field(default_factory=lambda: os.getenv("GOOGLE_API_KEY"))
    model_name: str = field(
        default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    )

    # Origens autorizadas a chamar a API a partir do navegador.
    allowed_origins: list[str] = field(
        default_factory=lambda: _env_list(
            "ALLOWED_ORIGINS",
            ["http://localhost:5173", "http://127.0.0.1:5173"],
        )
    )

    # Limites de upload. Protegem memória e custo de tokens.
    max_upload_bytes: int = field(
        default_factory=lambda: _env_int("MAX_UPLOAD_BYTES", 8 * MIB)
    )
    max_image_pixels: int = field(
        default_factory=lambda: _env_int("MAX_IMAGE_PIXELS", 40_000_000)
    )
    max_image_dimension: int = field(
        default_factory=lambda: _env_int("MAX_IMAGE_DIMENSION", 1536)
    )

    # Tempo máximo de espera pela resposta do Gemini, em segundos.
    request_timeout_seconds: int = field(
        default_factory=lambda: _env_int("REQUEST_TIMEOUT_SECONDS", 45)
    )

    # Janela deslizante de rate limiting por endereço de origem.
    rate_limit_requests: int = field(
        default_factory=lambda: _env_int("RATE_LIMIT_REQUESTS", 20)
    )
    rate_limit_window_seconds: int = field(
        default_factory=lambda: _env_int("RATE_LIMIT_WINDOW_SECONDS", 60)
    )

    host: str = field(default_factory=lambda: os.getenv("HOST", "127.0.0.1"))
    port: int = field(default_factory=lambda: _env_int("PORT", 8000))
    log_level: str = field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))

    @property
    def is_configured(self) -> bool:
        """Indica se há uma chave de API utilizável."""
        return bool(self.api_key and self.api_key.strip())


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Retorna as configurações em cache para o processo atual."""
    return Settings()
