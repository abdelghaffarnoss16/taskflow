"""Task CRUD routes. All routes require authentication and are scoped
to the currently logged-in user."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.logging_config import logger
from app.database.session import get_db
from app.models.task import TaskPriority, TaskStatus
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services import task_service

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
def get_tasks(
    status_filter: TaskStatus | None = Query(default=None, alias="status"),
    priority: TaskPriority | None = Query(default=None),
    search: str | None = Query(default=None, description="Search title/description"),
    sort_by: str = Query(default="created_at"),
    order: str = Query(default="desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List the current user's tasks, with optional filter/search/sort."""
    tasks = task_service.list_tasks(
        db,
        user_id=current_user.id,
        status=status_filter,
        priority=priority,
        search=search,
        sort_by=sort_by,
        order=order,
    )
    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new task owned by the current user."""
    task = task_service.create_task(db, payload, user_id=current_user.id)
    logger.info(f"Task created: id={task.id} by user_id={current_user.id}")
    return task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single task by id (must belong to the current user)."""
    task = task_service.get_task(db, task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a task (partial update supported) owned by the current user."""
    task = task_service.get_task(db, task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    updated = task_service.update_task(db, task, payload)
    logger.info(f"Task updated: id={task_id} by user_id={current_user.id}")
    return updated


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a task owned by the current user."""
    task = task_service.get_task(db, task_id, user_id=current_user.id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    task_service.delete_task(db, task)
    logger.info(f"Task deleted: id={task_id} by user_id={current_user.id}")
    return None
