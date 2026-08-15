"""Testes dos endpoints de status e da configuração de CORS."""

from __future__ import annotations


def test_raiz_retorna_status(client):
    response = client.get("/")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "online"
    assert body["mode"] == "engineer_active"
    assert body["ai_configured"] is True


def test_health_espelha_a_raiz(client):
    assert client.get("/health").json() == client.get("/").json()


def test_origem_autorizada_recebe_cabecalho_cors(client):
    response = client.get("/", headers={"Origin": "http://localhost:5173"})

    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_origem_desconhecida_nao_recebe_cors(client):
    """Antes, `allow_origins=['*']` liberava qualquer site a chamar a API."""
    response = client.get("/", headers={"Origin": "https://site-malicioso.example"})

    assert "access-control-allow-origin" not in response.headers


def test_metodo_nao_permitido(client):
    assert client.delete("/analyze").status_code == 405
