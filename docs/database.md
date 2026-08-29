# Database

TaskFlow uses **PostgreSQL** as its only data store, accessed through
**SQLAlchemy** (models + ORM queries) and validated at the API boundary
with **Pydantic** schemas.

## Tables / models

### `users` (`app/models/user.py`)

| Column           | Type      | Notes                                  |
|-------------------|-----------|------------------------------------------|
| id                 | integer    | Primary key                              |
| email              | string     | Unique, indexed                          |
| hashed_password    | string     | Bcrypt hash — never the plaintext password |
| full_name          | string     | Optional                                 |
| created_at         | datetime   | Set automatically on insert              |

### `tasks` (`app/models/task.py`)

| Column       | Type                              | Notes                                  |
|---------------|-------------------------------------|------------------------------------------|
| id             | integer                              | Primary key                              |
| title          | string                                | Required                                 |
| description    | text                                  | Optional                                 |
| status         | enum: `TODO`, `IN_PROGRESS`, `DONE`    | Defaults to `TODO`                       |
| priority       | enum: `LOW`, `MEDIUM`, `HIGH`           | Defaults to `MEDIUM`                     |
| created_at     | datetime                              | Set automatically on insert              |
| updated_at     | datetime                              | Refreshed automatically on every update  |
| user_id        | integer (foreign key -> `users.id`)     | Indexed; `ON DELETE CASCADE`             |

## Relationship

One `User` has many `Task`s:

```
users (1) ────< (many) tasks
```

Defined via SQLAlchemy's `relationship()` on both sides
(`User.tasks` / `Task.owner`), with `cascade="all, delete-orphan"` on the
`User` side — deleting a user also deletes all of their tasks, so no
orphaned rows are left behind.

## Table creation

This project intentionally uses SQLAlchemy's `Base.metadata.create_all()`
(see `app/database/init_db.py`), run once at application startup, instead
of a full migration framework like Alembic. This keeps the project
approachable for beginners: there's no separate migration step to learn
before the app runs for the first time.

**Trade-off:** `create_all()` will create missing tables, but it will
**not** alter existing tables if you change a model later (e.g. adding a
new column). If you evolve the schema after the database already has
data, you'll want to introduce Alembic migrations — a natural follow-up
exercise once the DevOps basics are in place.

## Connection configuration

The database connection string is read entirely from the `DATABASE_URL`
environment variable (see `app/core/config.py`), in standard PostgreSQL
URL format:

```
postgresql://<user>:<password>@<host>:<port>/<database>
```

- Locally (outside Docker): typically `localhost:5432`
- Inside Docker Compose: the hostname is the **service name** `db`, e.g.
  `postgresql://taskflow:taskflow@db:5432/taskflow` — Docker's internal
  DNS resolves `db` to the PostgreSQL container automatically.

## Health checks

`GET /health` (see `app/routes/system.py`) runs `SELECT 1` against the
database on every call. This is what later lets you wire up container
orchestration health checks, load balancer target health checks, or a
simple uptime monitor against a single, meaningful endpoint.
