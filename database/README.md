# database/

This directory is a placeholder for future database-related assets that
don't belong inside the `backend/` application code, for example:

- SQL seed/fixture scripts for local development
- Backup scripts (relevant to the "Backups" DevOps exercise)
- Alembic migration files, if you later replace `create_all()` with proper
  migrations
- Database documentation or ER diagrams

The actual PostgreSQL data itself is **not** stored here — it lives in a
Docker named volume (`taskflow-db-data`, see `docker-compose.yml`) so it
persists across container restarts.
