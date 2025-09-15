from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str
class UserCreate(UserBase): pass
class User(UserBase):
    id: int
    class Config:
        orm_mode = True

class ReminderBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[datetime] = None
    time: Optional[str] = None
    recurrence: Optional[str] = None
    status: Optional[str] = "pending"
    priority: Optional[str] = "normal"
    parent_event_id: Optional[int] = None

class ReminderCreate(ReminderBase): pass
class Reminder(ReminderBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[datetime] = None
    time: Optional[str] = None

class EventCreate(EventBase):
    reminder_ids: List[int]
class Event(EventBase):
    id: int
    user_id: int
    reminders: List[Reminder] = []
    class Config:
        orm_mode = True

class FolderBase(BaseModel):
    name: str
    parent_folder_id: Optional[int] = None

class FolderCreate(FolderBase): pass
class Folder(FolderBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        orm_mode = True

class FileBase(BaseModel):
    filename: str
    folder_id: Optional[int]
    file_type: Optional[str]

class FileCreate(FileBase): pass
class File(FileBase):
    id: int
    user_id: int
    path: str
    uploaded_at: datetime
    class Config:
        orm_mode = True

class ImageBase(BaseModel):
    file_id: int
    reminder_id: Optional[int]
    event_id: Optional[int]
    is_proof: Optional[bool] = False
    comments: Optional[str] = None

class ImageCreate(ImageBase): pass
class Image(ImageBase):
    id: int
    uploaded_at: datetime
    analyzed_text: Optional[str]
    ai_tags: Optional[str]
    comments: Optional[str] = None
    class Config:
        orm_mode = True