# TaskFlow

TaskFlow is a simple, beginner-friendly **Task Management** web
application built as a foundation for a DevOps and AWS learning project.
It's intentionally a straightforward monolith — **React → FastAPI →
PostgreSQL** — with no microservices, message queues, or other
distributed-systems complexity, so it's easy to containerize, deploy,
and instrument as you work through DevOps exercises.

## 1. Overview

With TaskFlow you can register an account, log in, and manage personal
tasks: create, view, edit, delete, mark complete, filter, search, and
sort. Every user can only ever see and modify their own tasks.

## 2. Architecture

```
 Browser
    │
    ▼
 React frontend (Vite + TypeScript)
    │  REST API (JSON) + JWT bearer auth
    ▼
 FastAPI backend (Python)
    │  SQLAlchemy ORM
    ▼
 PostgreSQL database
```

See [`docs/architecture.md`](docs/architecture.md) for a detailed
breakdown of the request lifecycle and directory-to-layer mapping, and
[`docs/authentication.md`](docs/authentication.md) /
[`docs/database.md`](docs/database.md) for deep dives on those topics.

## 3. Technology stack

**Frontend:** React, Vite, TypeScript, React Router, Axios
**Backend:** Python 3, FastAPI, SQLAlchemy, Pydantic, Uvicorn
**Database:** PostgreSQL
**Auth:** JWT (python-jose) + bcrypt password hashing (passlib)
**Testing:** pytest, httpx
**Containers:** Docker, Docker Compose, Nginx (serving the built frontend)

## 4. Project structure

```
taskflow/
│
├── frontend/                 # React + Vite + TypeScript SPA
│   ├── src/
│   │   ├── components/       # Reusable UI building blocks
│   │   ├── pages/             # Route-level views
│   │   ├── services/          # Centralized API client + API calls
│   │   ├── hooks/              # React hooks (auth context, task state)
│   │   ├── types/               # Shared TypeScript types
│   │   └── styles/               # Global CSS
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
│
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── main.py              # App entry point, middleware, routers
│   │   ├── routes/               # API endpoints (auth, tasks, system)
│   │   ├── models/                # SQLAlchemy ORM models
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── services/                # Business logic
│   │   ├── database/                 # DB session + init
│   │   └── core/                      # Config, security, logging, deps
│   ├── tests/                    # pytest test suite
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── database/                  # DB-related docs/scripts (no live data)
├── docs/                       # Architecture, auth, and DB documentation
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 5. Local setup (without Docker)

### Prerequisites

- Python 3.12+
- Node.js 20+
- A running PostgreSQL instance (local install, or run just the `db`
  service from Docker Compose — see below)

### 5.1 Start PostgreSQL

If you don't want to install PostgreSQL locally, you can start just the
database container:

```bash
docker compose up db
```

This exposes PostgreSQL on `localhost:5432` with user/password/database
all set to `taskflow` (see `docker-compose.yml`).

### 5.2 Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env if needed — defaults match the docker-compose `db` service.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`, with interactive
docs at `http://localhost:8000/docs`.

### 5.3 Frontend setup

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## 6. Environment variables

### Backend (`backend/.env`, see `backend/.env.example`)

| Variable                        | Description                                    | Example                                             |
|-----------------------------------|--------------------------------------------------|--------------------------------------------------------|
| `DATABASE_URL`                     | PostgreSQL connection string                        | `postgresql://taskflow:taskflow@localhost:5432/taskflow` |
| `SECRET_KEY`                        | Secret used to sign JWTs — must be kept private        | (long random string)                                     |
| `ALGORITHM`                          | JWT signing algorithm                                     | `HS256`                                                    |
| `ACCESS_TOKEN_EXPIRE_MINUTES`         | JWT lifetime in minutes                                     | `60`                                                        |
| `APP_VERSION`                          | Returned by `GET /api/version`                               | `1.0.0`                                                      |
| `APP_NAME`                              | Display name used in logs/docs                                | `TaskFlow API`                                                |
| `ENVIRONMENT`                             | `development`, `production`, or `test`                          | `development`                                                  |
| `CORS_ORIGINS`                             | Comma-separated list of allowed frontend origins                   | `http://localhost:5173,http://localhost:3000`                    |

### Frontend (`frontend/.env`, see `frontend/.env.example`)

| Variable          | Description                    | Example                  |
|--------------------|-----------------------------------|-----------------------------|
| `VITE_API_URL`      | Base URL of the FastAPI backend      | `http://localhost:8000`      |

**Never commit real `.env` files.** Only `.env.example` files (with
placeholder values) belong in version control — this is enforced in
`.gitignore`.

## 7. Database setup

Tables are created automatically at backend startup via SQLAlchemy's
`create_all()` — there's no separate migration step to run for a fresh
database. See [`docs/database.md`](docs/database.md) for the full schema
and an explanation of this design choice (and its trade-offs).

## 8. Running with Docker Compose

This is the easiest way to run the entire stack:

```bash
docker compose up --build
```

This starts three containers on a shared Docker network
(`taskflow-network`):

| Service    | Container name       | Host port | Purpose                      |
|-------------|--------------------------|-------------|----------------------------------|
| `db`         | `taskflow-db`             | `5432`        | PostgreSQL                          |
| `backend`     | `taskflow-backend`          | `8000`         | FastAPI REST API                     |
| `frontend`     | `taskflow-frontend`           | `3000`          | React app, served via Nginx           |

Once it's up:
- Frontend: **http://localhost:3000**
- Backend API docs: **http://localhost:8000/docs**
- Health check: **http://localhost:8000/health**

To stop everything:

```bash
docker compose down
```

To also remove the database volume (⚠️ deletes all data):

```bash
docker compose down -v
```

**Note on `VITE_API_URL` in Docker:** Vite bakes environment variables
into the static build at *build time*, not at container runtime. The
`docker-compose.yml` passes `VITE_API_URL=http://localhost:8000` as a
build argument, which works because the browser (not the frontend
container) is what actually calls the backend, and the browser reaches
it via the host's published port. If you deploy this behind a different
domain later, rebuild the frontend image with the correct `VITE_API_URL`.

## 9. Running tests

```bash
cd backend
source venv/bin/activate   # if using a virtual environment
pytest -v
```

Tests run against an isolated in-memory SQLite database (see
`backend/tests/conftest.py`) — no PostgreSQL connection is required to
run the test suite. Test coverage includes:

- `/health` and `/api/version`
- User registration (including duplicate-email rejection)
- Login (correct and incorrect credentials)
- Creating, listing, updating, and deleting tasks
- Authentication is required to access tasks
- A user cannot access another user's tasks

## 10. API endpoints

| Method   | Path                    | Auth required | Description                          |
|-----------|--------------------------|-----------------|------------------------------------------|
| GET        | `/health`                  | No                | Health check (also verifies DB connectivity) |
| GET        | `/api/version`               | No                | Returns the current app version                |
| POST        | `/api/auth/register`           | No                | Register a new user, returns a JWT               |
| POST        | `/api/auth/login`                | No                | Log in, returns a JWT                              |
| GET          | `/api/tasks`                       | Yes                | List the current user's tasks (supports filter/search/sort query params) |
| POST          | `/api/tasks`                         | Yes                | Create a new task                                     |
| GET            | `/api/tasks/{id}`                       | Yes                | Retrieve a single task                                  |
| PUT             | `/api/tasks/{id}`                          | Yes                | Update a task (partial updates supported)                 |
| DELETE           | `/api/tasks/{id}`                             | Yes                | Delete a task                                                |

Query parameters supported on `GET /api/tasks`: `status`, `priority`,
`search`, `sort_by` (`created_at` | `updated_at` | `title` | `priority` |
`status`), `order` (`asc` | `desc`).

Full interactive documentation (Swagger UI) is auto-generated by FastAPI
at `/docs` whenever the backend is running.

## 11. What each major directory does

| Directory                        | Responsibility                                                      |
|-------------------------------------|--------------------------------------------------------------------------|
| `backend/app/routes/`                  | HTTP endpoint definitions — request/response handling only, no business logic |
| `backend/app/services/`                  | Business logic (registration, authentication, task CRUD, filtering)          |
| `backend/app/models/`                      | SQLAlchemy ORM models (`User`, `Task`)                                          |
| `backend/app/schemas/`                       | Pydantic schemas — request validation and response shaping                        |
| `backend/app/core/`                            | Cross-cutting concerns: settings, JWT/password security, logging, auth dependency |
| `backend/app/database/`                          | DB engine/session setup and table initialization                                     |
| `backend/tests/`                                   | pytest test suite                                                                       |
| `frontend/src/pages/`                                | Route-level views (Login, Register, Dashboard, Tasks, Task Details)                       |
| `frontend/src/components/`                             | Reusable UI pieces (Navbar, Sidebar, TaskCard, TaskForm, etc.)                               |
| `frontend/src/services/`                                 | Centralized API client (Axios) — the only place HTTP calls are made                            |
| `frontend/src/hooks/`                                      | React hooks: `AuthContext` (global auth state), `useTasks` (task state/CRUD)                     |
| `frontend/src/types/`                                        | Shared TypeScript types mirroring backend schemas                                                    |

## 12. Most important files

| File                                            | Responsibility                                                        |
|---------------------------------------------------|----------------------------------------------------------------------------|
| `backend/app/main.py`                                | FastAPI app instance, CORS, request-logging middleware, router registration, startup logic |
| `backend/app/core/config.py`                            | Reads all configuration from environment variables                             |
| `backend/app/core/security.py`                            | Password hashing and JWT creation/verification                                     |
| `backend/app/core/deps.py`                                   | `get_current_user` — the dependency every protected route relies on                  |
| `backend/app/models/user.py` / `task.py`                        | Database schema definitions                                                             |
| `backend/app/services/auth_service.py`                            | Registration and login logic                                                              |
| `backend/app/services/task_service.py`                              | Task CRUD, filtering, search, sorting — always scoped by `user_id`                          |
| `frontend/src/services/apiClient.ts`                                   | Axios instance with automatic JWT attachment and 401 handling                                  |
| `frontend/src/hooks/AuthContext.tsx`                                     | Global authentication state (login/register/logout, persisted in `localStorage`)                  |
| `frontend/src/hooks/useTasks.ts`                                            | Task list state, loading/error handling, and CRUD actions used by the Tasks page                    |
| `docker-compose.yml`                                                          | Orchestrates `frontend`, `backend`, and `db` on a shared Docker network                                 |

## 13. Troubleshooting

**Backend can't connect to the database**
Check `DATABASE_URL`. If running the backend outside Docker but the
database inside Docker, use `localhost:5432` (the port Docker publishes
to the host), not `db:5432` (`db` only resolves inside the Docker network).

**Frontend shows network errors / CORS errors**
Make sure `VITE_API_URL` in `frontend/.env` matches where your backend is
actually running, and that `CORS_ORIGINS` in `backend/.env` includes the
frontend's origin (e.g. `http://localhost:5173`).

**`docker compose up` fails on the `frontend` service**
Confirm `backend` built successfully first — `frontend` depends on
`backend` starting. Check logs with `docker compose logs frontend`.

**Login/Register returns 401/400 unexpectedly**
- 400 on register usually means the email is already registered.
- 401 on login means the email/password combination is wrong.
- 401 on other endpoints usually means the JWT is missing, expired, or
  malformed — try logging in again.

**Tests fail locally**
Make sure you're running `pytest` from inside `backend/` with the
virtual environment activated and dependencies installed. The tests use
an in-memory SQLite database and do **not** require PostgreSQL to be running.

**Health check reports `"database": "unreachable"`**
This means the backend process is up but cannot reach PostgreSQL. Check
that the `db` container/service is running and that `DATABASE_URL` is correct.

## 14. Before moving on to the DevOps/AWS phase

Before layering on containerization, CI/CD, and cloud deployment, verify:

- [ ] `docker compose up --build` starts all three services without errors
- [ ] You can register a new user through the frontend UI
- [ ] You can log in, and the dashboard loads your task stats
- [ ] You can create, edit, complete, and delete a task end-to-end
- [ ] `GET http://localhost:8000/health` returns `{"status": "healthy", "database": "reachable"}`
- [ ] `GET http://localhost:8000/api/version` returns `{"version": "1.0.0"}`
- [ ] `pytest -v` passes all tests in `backend/tests/`
- [ ] You understand where environment variables are read from in both
      the frontend and backend, since you'll be injecting these
      differently once you move to AWS (e.g. via ECS task definitions,
      Secrets Manager, or Kubernetes secrets/configmaps)
- [ ] You've read `docs/architecture.md`, `docs/authentication.md`, and
      `docs/database.md`

Once all of the above are true, you have a solid, working foundation to
start layering on the DevOps exercises: Nginx reverse proxy, GitHub
Actions CI/CD, Amazon ECR, EC2/ECS/EKS deployment, Prometheus/Grafana,
centralized logging, cron-based backups, S3/CloudFront, and eventually
Kubernetes.
