from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import os

from app import models, schemas, crud, database, ai_tasks, utils

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="To-Do/Reminder Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="To-Do/Reminder Backend")

app.mount("/static", StaticFiles(directory="app/static"), name="static")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Welcome/Index Endpoint ---
@app.get("/api/welcome/")
def welcome():
    return {"message": "Welcome to the To-Do/Reminder API!"}

# --- Login Endpoint ---
@app.post("/api/login/", response_model=schemas.User)
def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email)
    if not user or not utils.verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user

# --- User Endpoints ---
@app.post("/api/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)

# --- Reminder Endpoints ---
@app.post("/api/reminders/", response_model=schemas.Reminder)
def create_reminder(user_id: int = Form(...), title: str = Form(...), description: str = Form(None),
                    date: str = Form(None), time: str = Form(None), recurrence: str = Form(None),
                    status: str = Form("pending"), priority: str = Form("normal"),
                    parent_event_id: int = Form(None), db: Session = Depends(get_db)):
    reminder = schemas.ReminderCreate(
        title=title, description=description, date=date, time=time,
        recurrence=recurrence, status=status, priority=priority,
        parent_event_id=parent_event_id
    )
    return crud.create_reminder(db, user_id, reminder)

@app.get("/api/reminders/", response_model=List[schemas.Reminder])
def get_reminders(user_id: int, db: Session = Depends(get_db)):
    return crud.get_reminders_by_user(db, user_id)

# --- Event Endpoints ---
@app.post("/api/events/", response_model=schemas.Event)
def create_event(user_id: int, event: schemas.EventCreate, db: Session = Depends(get_db)):
    return crud.create_event(db, user_id, event)

@app.get("/api/events/", response_model=List[schemas.Event])
def get_events(user_id: int, db: Session = Depends(get_db)):
    return crud.get_events_by_user(db, user_id)

# --- Folder Endpoints ---
@app.post("/api/folders/", response_model=schemas.Folder)
def create_folder(user_id: int, folder: schemas.FolderCreate, db: Session = Depends(get_db)):
    return crud.create_folder(db, user_id, folder)

@app.get("/api/folders/", response_model=List[schemas.Folder])
def get_folders(user_id: int, db: Session = Depends(get_db)):
    return crud.get_folders_by_user(db, user_id)

# --- File Upload Endpoints ---
@app.post("/api/files/", response_model=schemas.File)
async def upload_file(user_id: int = Form(...), folder_id: int = Form(None), file: UploadFile = File(...),
                     db: Session = Depends(get_db)):
    filename = file.filename
    file_type = filename.split(".")[-1]
    dest_folder = f"app/static/uploads/user_{user_id}/"
    path = os.path.join(dest_folder, filename)
    utils.save_upload_file(file, path)
    file_in = schemas.FileCreate(filename=filename, folder_id=folder_id, file_type=file_type)
    return crud.create_file(db, user_id, file_in, path=path)

@app.get("/api/files/", response_model=List[schemas.File])
def get_files(user_id: int, db: Session = Depends(get_db)):
    return crud.get_files_by_user(db, user_id)

# --- Image Upload, Proof, AI Analysis ---
@app.post("/api/images/", response_model=schemas.Image)
async def upload_image(
    background_tasks: BackgroundTasks,
    file_id: int = Form(...),
    reminder_id: int = Form(None),
    event_id: int = Form(None),
    is_proof: bool = Form(False),
    db: Session = Depends(get_db)
):
    # Find file path
    db_file = crud.get_file_by_id(db, file_id)
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    path = db_file.path

    # AI analysis in background
    def analyze_and_save():
        text, tags = ai_tasks.analyze_image_from_path(path)
        crud.create_image(
            db,
            image=schemas.ImageCreate(
                file_id=file_id,
                reminder_id=reminder_id,
                event_id=event_id,
                is_proof=is_proof
            ),
            analyzed_text=text,
            ai_tags=tags
        )
    background_tasks.add_task(analyze_and_save)
    # Return a stub for now, actual Image will be created after background task
    return schemas.Image(
        id=0, file_id=file_id, reminder_id=reminder_id, event_id=event_id,
        uploaded_at=None, analyzed_text=None, ai_tags=None, is_proof=is_proof
    )

@app.patch("/api/images/{image_id}/comment/", response_model=schemas.Image)
def update_image_comment(image_id: int, comments: str = Form(...), db: Session = Depends(get_db)):
    image = crud.update_image_comment(db, image_id, comments)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return image

@app.get("/api/images/", response_model=List[schemas.Image])
def get_images(user_id: int, db: Session = Depends(get_db)):
    return crud.get_images_by_user(db, user_id)

# --- Memories & Slides ---
@app.get("/api/memories/")
def get_memories(user_id: int, db: Session = Depends(get_db)):
    # Aggregate images as slides, ordered by event, reminder, datetime (desc)
    slides = []
    images = crud.get_images_by_user(db, user_id)
    for img in images:
        slide = {
            "image_id": img.id,
            "file_path": crud.get_file_by_id(db, img.file_id).path if img.file_id else None,
            "reminder_id": img.reminder_id,
            "event_id": img.event_id,
            "is_proof": img.is_proof,
            "analyzed_text": img.analyzed_text,
            "ai_tags": img.ai_tags,
            "comments": getattr(img, "comments", None),
            "uploaded_at": img.uploaded_at,
            # You can add more: reminder/event title, status, etc.
        }
        slides.append(slide)
    # Sort by uploaded_at descending (most recent first)
    slides = sorted(slides, key=lambda x: x["uploaded_at"] or "", reverse=True)
    return {"slides": slides}


# --- Prediction stub endpoint ---
@app.get("/api/predictions/")
def get_predictions(user_id: int, db: Session = Depends(get_db)):
    # TODO: Implement real AI logic
    # For now, just return example suggested reminders based on "patterns"
    reminders = crud.get_reminders_by_user(db, user_id)
    suggestions = []
    for rem in reminders:
        if rem.status != "done":
            suggestions.append({
                "suggested_title": f"Retry: {rem.title}",
                "date": None,
                "reason": "Not done yet"
            })
    # Add more ML/AI logic here...
    return {"suggested_reminders": suggestions}

# --- For React Frontend: You can serve a simple HTML/JS/CSS page now,
# and later serve React build from a /frontend directory or via CORS.