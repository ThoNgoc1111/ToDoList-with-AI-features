from sqlalchemy.orm import Session
from app import models, schemas
from typing import List, Optional

# User
def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Reminder
def create_reminder(db: Session, user_id: int, reminder: schemas.ReminderCreate):
    db_reminder = models.Reminder(**reminder.dict(), user_id=user_id)
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder

def get_reminders_by_user(db: Session, user_id: int):
    return db.query(models.Reminder).filter(models.Reminder.user_id == user_id).all()

def get_reminder_by_id(db: Session, reminder_id: int) -> Optional[models.Reminder]:
    return db.query(models.Reminder).filter(models.Reminder.id == reminder_id).first()

# Event
def create_event(db: Session, user_id: int, event: schemas.EventCreate):
    db_event = models.Event(
        user_id=user_id,
        title=event.title,
        description=event.description,
        date=event.date,
        time=event.time
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    # Link reminders
    for rid in event.reminder_ids:
        reminder = db.query(models.Reminder).filter_by(id=rid).first()
        if reminder:
            reminder.parent_event_id = db_event.id
    db.commit()
    db.refresh(db_event)
    return db_event

def get_events_by_user(db: Session, user_id: int):
    return db.query(models.Event).filter(models.Event.user_id == user_id).all()

def get_event_by_id(db: Session, event_id: int) -> Optional[models.Event]:
    return db.query(models.Event).filter(models.Event.id == event_id).first()

# Folder CRUD
def create_folder(db: Session, user_id: int, folder: schemas.FolderCreate):
    db_folder = models.Folder(**folder.dict(), user_id=user_id)
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    return db_folder

def get_folders_by_user(db: Session, user_id: int):
    return db.query(models.Folder).filter(models.Folder.user_id == user_id).all()

# File CRUD
def create_file(db: Session, user_id: int, file: schemas.FileCreate, path: str):
    db_file = models.File(**file.dict(), user_id=user_id, path=path)
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file

def get_files_by_user(db: Session, user_id: int):
    return db.query(models.File).filter(models.File.user_id == user_id).all()

def get_file_by_id(db: Session, file_id: int):
    return db.query(models.File).filter(models.File.id == file_id).first()

# Image CRUD
def create_image(db: Session, image: schemas.ImageCreate, analyzed_text: str = "", ai_tags: str = ""):
    from .models import Image
    db_image = Image(
        file_id=image.file_id,
        reminder_id=image.reminder_id,
        event_id=image.event_id,
        is_proof=image.is_proof,
        analyzed_text=analyzed_text,
        ai_tags=ai_tags
    )
    from .database import SessionLocal
    db = SessionLocal()
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    db.close()
    return db_image

def get_images_by_user(db: Session, user_id: int):
    # Get all images for files owned by user
    from sqlalchemy.orm import aliased
    File = models.File
    Image = models.Image
    return db.query(Image).join(File, File.id == Image.file_id).filter(File.user_id == user_id).all()

def get_images_by_event(db: Session, event_id: int):
    return db.query(models.Image).filter(models.Image.event_id == event_id).all()

def get_images_by_reminder(db: Session, reminder_id: int):
    return db.query(models.Image).filter(models.Image.reminder_id == reminder_id).all()

def update_image_comment(db: Session, image_id: int, comments: str):
    image = db.query(models.Image).filter(models.Image.id == image_id).first()
    if image:
        image.comments = comments
        db.commit()
        db.refresh(image)
    return image