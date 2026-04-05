from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_index_renders():
    response = client.get("/")
    assert response.status_code == 200
    assert "Skatteuttag" in response.text


def test_api_calculate_returns_json():
    response = client.post("/api/calculate", json={"year": 2026})
    assert response.status_code == 200
    payload = response.json()
    assert payload["recommended"]["salary"] >= 0


def test_security_and_sitemap_exist():
    assert client.get("/security.txt").status_code == 200
    assert client.get("/sitemap.xml").status_code == 200
