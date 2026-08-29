# Architecture

TaskFlow is a deliberately simple **monolithic** full-stack application.
There are only three moving parts, and they talk to each other in a
straight line:

```
 Browser
    │
    │  HTTPS/HTTP (user interacts with the UI)
    ▼
 React frontend (Vite + TypeScript)
    │
    │  REST API calls over HTTP (JSON), via Axios
    │  Authorization: Bearer <JWT>
    ▼
 FastAPI backend (Python REST API)
    │
    │  SQL, via SQLAlchemy ORM
    ▼
 PostgreSQL database
```

## Why this shape?

The project spec intentionally avoids microservices, message queues, and
other distributed-systems complexity. That's a deliberate choice: this
app is meant to be a **foundation for a DevOps/AWS learning path**, not a
demonstration of complex application architecture. A simple, well-defined
monolith is easier to:

- Containerize (one Dockerfile per service, three services total)
- Deploy to a single EC2 instance or a small ECS/EKS setup
- Put behind an Nginx reverse proxy
- Wire into CI/CD (build → test → push image → deploy)
- Instrument with logging/metrics without needing distributed tracing

## Request lifecycle (example: creating a task)

1. The user fills in the "New Task" form in the React app and submits it.
2. `frontend/src/services/taskService.ts` calls `apiClient.post('/api/tasks', ...)`.
3. Axios's request interceptor (`apiClient.ts`) automatically attaches the
   JWT stored in `localStorage` as an `Authorization: Bearer <token>` header.
4. The request hits FastAPI's logging middleware (`main.py`), which logs
   `"Request received: POST /api/tasks"`.
5. FastAPI resolves the `get_current_user` dependency, which decodes the
   JWT and loads the corresponding `User` row from PostgreSQL.
6. The `tasks.create_task` route calls `task_service.create_task()`,
   which inserts a new row scoped to `user_id`.
7. The new task is serialized through the `TaskResponse` Pydantic schema
   and returned as JSON.
8. The middleware logs the response status and duration.
9. The frontend updates its local React state so the new task appears
   immediately, without a full page reload.

## Directory-to-layer mapping

| Layer                | Backend location            | Frontend location          |
|-----------------------|-----------------------------|-----------------------------|
| Presentation           | —                            | `src/pages/`, `src/components/` |
| API/routing            | `app/routes/`                | `src/services/` (API calls) |
| Business logic          | `app/services/`               | `src/hooks/` (state/orchestration) |
| Data access             | `app/models/` + SQLAlchemy    | —                            |
| Validation/contracts    | `app/schemas/` (Pydantic)      | `src/types/` (TypeScript)    |
| Configuration            | `app/core/config.py`            | `.env` / `vite.config.ts`     |

## What's intentionally *not* included yet

Per the project scope, none of the following are implemented yet — they
are left as later exercises once this application is running:

Nginx reverse proxy in front of the whole stack, GitHub Actions CI/CD,
Amazon ECR image publishing, Prometheus/Grafana monitoring, centralized
log aggregation, cron-based backups, S3/CloudFront, and Kubernetes
manifests. The app's structure (clear separation of concerns, environment
variable configuration, a working `/health` endpoint, and Docker Compose)
is designed so that each of these can be layered on without needing to
rewrite application code.
