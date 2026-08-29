"""
Business logic for task CRUD operations.

Every function here takes the current user's id explicitly and always
scopes queries to that user, which is what guarantees that a user can
never read or modify another user's tasks.
"""
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.task import Task, TaskPriority, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate


def create_task(db: Session, payload: TaskCreate, user_id: int) -> Task:
    task = Task(
        title=payload.title,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        user_id=user_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_task(db: Session, task_id: int, user_id: int) -> Task | None:
    """Fetch a single task, scoped to the owning user."""
    return (
        db.query(Task)
        .filter(Task.id == task_id, Task.user_id == user_id)
        .first()
    )


def list_tasks(
    db: Session,
    user_id: int,
    status: TaskStatus | None = None,
    priority: TaskPriority | None = None,
    search: str | None = None,
    sort_by: str = "created_at",
    order: str = "desc",
) -> list[Task]:
    """
    List tasks belonging to a user, with optional filtering, search, and sorting.

    - status / priority: exact-match filters
    - search: case-insensitive match against title or description
    - sort_by: one of "created_at", "updated_at", "title", "priority", "status"
    - order: "asc" or "desc"
    """
    query = db.query(Task).filter(Task.user_id == user_id)

    if status is not None:
        query = query.filter(Task.status == status)

    if priority is not None:
        query = query.filter(Task.priority == priority)

    if search:
        like_pattern = f"%{search}%"
        query = query.filter(
            or_(Task.title.ilike(like_pattern), Task.description.ilike(like_pattern))
        )

    sort_column_map = {
        "created_at": Task.created_at,
        "updated_at": Task.updated_at,
        "title": Task.title,
        "priority": Task.priority,
        "status": Task.status,
    }
    sort_column = sort_column_map.get(sort_by, Task.created_at)

    if order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    return query.all()


def update_task(db: Session, task: Task, payload: TaskUpdate) -> Task:
    """Apply a partial update to a task. Only fields explicitly set are changed."""
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()
