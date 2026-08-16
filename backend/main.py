"""Ponto de entrada do servidor.

Mantido para que `python main.py` continue funcionando como antes. Em produção,
prefira executar diretamente pelo uvicorn:

    uvicorn app.main:app --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import uvicorn

from app.config import get_settings
from app.main import app

__all__ = ["app"]


if __name__ == "__main__":
    settings = get_settings()
    # O padrão é 127.0.0.1: expor em 0.0.0.0 passa a ser uma escolha explícita
    # via variável de ambiente, e não o comportamento padrão de desenvolvimento.
    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
        log_level=settings.log_level.lower(),
    )
