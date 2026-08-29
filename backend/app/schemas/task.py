"""Pydantic schemas for Task-related requests and responses."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.task import TaskPriority, TaskStatus


class TaskCreate(BaseModel):
    """Payload for POST /api/tasks"""
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM


class TaskUpdate(BaseModel):
    """
    Payload for PUT /api/tasks/{id}

    All fields are optional so the client can update just the fields it
    needs (e.g. only toggling `status` to mark a task complete).
    """
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None


class TaskResponse(BaseModel):
    """Representation of a task returned to the client."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    status: TaskStatus
    priority: TaskPriority
    created_at: datetime
    updated_at: datetime
    user_id: int
