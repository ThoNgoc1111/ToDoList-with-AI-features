from sqlalchemy import ForeignKey, String, Integer, DateTime, Boolean, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)

class Event(Base):
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    date: Mapped[DateTime] = mapped_column(DateTime)
    time: Mapped[str] = mapped_column(String(10))
    reminders: Mapped[list["Reminder"]] = relationship("Reminder", back_populates="event")

class Reminder(Base):
    __tablename__ = "reminders"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    date: Mapped[DateTime] = mapped_column(DateTime)
    time: Mapped[str] = mapped_column(String(10))
    recurrence: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(50))
    priority: Mapped[str] = mapped_column(String(50))
    parent_event_id: Mapped[int | None] = mapped_column(ForeignKey('events.id'), nullable=True)
    event: Mapped["Event"] = relationship("Event", back_populates="reminders")

class Folder(Base):
    __tablename__ = "folders"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    name: Mapped[str] = mapped_column(String(255))
    parent_folder_id: Mapped[int | None] = mapped_column(ForeignKey('folders.id'), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

class File(Base):
    __tablename__ = "files"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    filename: Mapped[str] = mapped_column(String(255))
    path: Mapped[str] = mapped_column(String(255))
    uploaded_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    folder_id: Mapped[int | None] = mapped_column(ForeignKey('folders.id'), nullable=True)
    file_type: Mapped[str] = mapped_column(String(50))

class Image(Base):
    __tablename__ = "images"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    file_id: Mapped[int] = mapped_column(ForeignKey('files.id'))
    reminder_id: Mapped[int | None] = mapped_column(ForeignKey('reminders.id'), nullable=True)
    event_id: Mapped[int | None] = mapped_column(ForeignKey('events.id'), nullable=True)
    uploaded_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    analyzed_text: Mapped[str] = mapped_column(Text)
    ai_tags: Mapped[str] = mapped_column(Text)
    is_proof: Mapped[bool] = mapped_column(Boolean, default=False)
    comments: Mapped[str | None] = mapped_column(Text, nullable=True)  # support for user comments on image