"""Rate limiting simples por endereço de origem.

Cada chamada a `/analyze` consome cota da API do Gemini, que é paga. Sem
nenhum limite, qualquer pessoa com a URL do backend consegue esgotar a cota (e
gerar custo) em poucos segundos com um laço de requisições.

Implementação em janela deslizante e em memória: suficiente para uma instância
única. Em múltiplas réplicas o estado não é compartilhado — nesse cenário troque
por um backend como Redis.
"""

from __future__ import annotations

import threading
import time
from collections import defaultdict, deque


class SlidingWindowRateLimiter:
    """Permite no máximo `max_requests` por `window_seconds` para cada chave."""

    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self._max_requests = max_requests
        self._window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, key: str) -> tuple[bool, int]:
        """Registra uma tentativa e informa se ela é permitida.

        Args:
            key: Identificador do chamador (tipicamente o IP).

        Returns:
            `(permitido, segundos_para_liberar)`. O segundo item é 0 quando a
            requisição foi permitida.
        """
        if self._max_requests <= 0:
            return True, 0

        now = time.monotonic()
        cutoff = now - self._window_seconds

        with self._lock:
            timestamps = self._hits[key]
            while timestamps and timestamps[0] <= cutoff:
                timestamps.popleft()

            if len(timestamps) >= self._max_requests:
                retry_after = int(timestamps[0] + self._window_seconds - now) + 1
                return False, max(retry_after, 1)

            timestamps.append(now)

            # Evita crescimento indefinido do dicionário com chaves ociosas.
            if len(self._hits) > 10_000:
                self._prune(cutoff)

            return True, 0

    def _prune(self, cutoff: float) -> None:
        """Descarta chaves sem nenhuma requisição dentro da janela."""
        stale = [key for key, hits in self._hits.items() if not hits or hits[-1] <= cutoff]
        for key in stale:
            del self._hits[key]

    def reset(self) -> None:
        """Limpa todo o estado. Usado entre testes."""
        with self._lock:
            self._hits.clear()
