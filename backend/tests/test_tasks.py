"""Tests for task creation, retrieval, updating, and deletion."""


def test_create_task(client, auth_headers):
    response = client.post(
        "/api/tasks",
        json={"title": "Write tests", "description": "Cover the main endpoints"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Write tests"
    assert body["status"] == "TODO"
    assert body["priority"] == "MEDIUM"


def test_get_tasks_returns_only_own_tasks(client, auth_headers):
    client.post("/api/tasks", json={"title": "Task A"}, headers=auth_headers)
    client.post("/api/tasks", json={"title": "Task B"}, headers=auth_headers)

    response = client.get("/api/tasks", headers=auth_headers)
    assert response.status_code == 200
    titles = [task["title"] for task in response.json()]
    assert "Task A" in titles
    assert "Task B" in titles


def test_get_tasks_requires_authentication(client):
    response = client.get("/api/tasks")
    assert response.status_code == 401


def test_update_task(client, auth_headers):
    create_response = client.post(
        "/api/tasks", json={"title": "Original title"}, headers=auth_headers
    )
    task_id = create_response.json()["id"]

    update_response = client.put(
        f"/api/tasks/{task_id}",
        json={"status": "DONE"},
        headers=auth_headers,
    )
    assert update_response.status_code == 200
    body = update_response.json()
    assert body["status"] == "DONE"
    assert body["title"] == "Original title"  # unchanged


def test_delete_task(client, auth_headers):
    create_response = client.post(
        "/api/tasks", json={"title": "Temporary task"}, headers=auth_headers
    )
    task_id = create_response.json()["id"]

    delete_response = client.delete(f"/api/tasks/{task_id}", headers=auth_headers)
    assert delete_response.status_code == 204

    get_response = client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert get_response.status_code == 404


def test_cannot_access_another_users_task(client, db_session):
    # User 1 creates a task
    resp1 = client.post(
        "/api/auth/register",
        json={"email": "user1@example.com", "password": "password123"},
    )
    headers1 = {"Authorization": f"Bearer {resp1.json()['access_token']}"}
    task_resp = client.post("/api/tasks", json={"title": "User1 task"}, headers=headers1)
    task_id = task_resp.json()["id"]

    # User 2 tries to access it
    resp2 = client.post(
        "/api/auth/register",
        json={"email": "user2@example.com", "password": "password123"},
    )
    headers2 = {"Authorization": f"Bearer {resp2.json()['access_token']}"}
    response = client.get(f"/api/tasks/{task_id}", headers=headers2)
    assert response.status_code == 404
