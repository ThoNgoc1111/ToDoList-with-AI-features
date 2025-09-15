[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/YHSq4TPZ)
# To-Do App – Preliminary Assignment Submission
⚠️ Please complete **all sections marked with the ✍️ icon** — these are required for your submission.

👀 Please Check ASSIGNMENT.md file in this repository for assignment requirements.

## 🚀 Project Setup & Usage
**How to install and run your project:**  
- Install this repositry and navigate to the backend folder.
    On Windows:
    ```
    cd "<YOUR_CURRENT_FOLDER\web-track-naver-vietnam-ai-hackathon-ThoNgoc1111\todolist\backend\app>"
    ```
- Create and activate a virtual environment:
    On Windows:
    ```
    python -m venv venv
    venv\Scripts\activate
    ```
- Install all dependencies:
    On Windows:
    ```
    current directory: <YOUR_CURRENT_FOLDER\web-track-naver-vietnam-ai-hackathon-ThoNgoc1111\todolist\backend\app>
   pip install -r requirements.txt
    ```
- Set up your PostgreSQL database (Make sure your PostgreSQL is running):
    ```
    psql -U postgres
    CREATE DATABASE todo_db;
    \q
    ```
- Then run the FastAPI backend server:
    ```
    uvicorn main:app --reload
    ```
- Access the API docs for testing:
    Open http://localhost:8000/docs in your browser.
## 🔗 Deployed Web URL or APK file
- Link: https://www.loom.com/share/ccf3dc40e8f14c479ce0cadd7bb4c0a5?sid=61c90273-5294-4ff5-8caf-ef1c3b2ea2ca

## 🎥 Demo Video
**Demo video link (≤ 2 minutes):**  
📌 **Video Upload Guideline:** when uploading your demo video to YouTube, please set the visibility to **Unlisted**.  
- Link: https://www.loom.com/share/ccf3dc40e8f14c479ce0cadd7bb4c0a5?sid=61c90273-5294-4ff5-8caf-ef1c3b2ea2ca


## 💻 Project Introduction

### a. Overview

This To-Do List web app is more than just a typical task management tool. It is designed as a smart reminder and memory platform, allowing users to create daily reminders and events, organize files and images, and even leverage AI to analyze and extract knowledge from photos. The application serves not only as a productivity aid but also as a digital diary that helps users build meaningful memories and receive intelligent suggestions for future planning.

### b. Key Features & Function Manual

- **Reminders & Events:**  
  Users can create, edit, and delete daily reminders. Reminders can be grouped into events, making it easy to handle multi-step tasks (e.g. "Prepare for Trip" with sub-tasks).
- **Task Completion with Proof:**  
  When marking a task as completed, users can upload images as proof. These images are linked to reminders or events.
- **File & Folder Organization:**  
  Users can archive files, images, and notes into folders, supporting a hierarchical structure for better organization.
- **Memory Slideshows:**  
  The app generates slideshows from completed events/reminders and their associated images, providing a visual memory lane for the user.
- **AI Image Analysis:**  
  Uploaded images are automatically analyzed (using OCR and tag extraction) to generate descriptive text and keywords, which are stored with each image.
- **Smart Suggestions:**  
  The app can suggest future tasks or recurring reminders based on user activity patterns and past memories.
- **Search & Filter:**  
  Users can search for memories, tasks, or files using keywords, tags, or dates.

### c. Unique Features (What’s special about this app?) 

- **Integrated AI Analysis:**  
  The app uses AI to extract text and tags from uploaded images, enhancing searchability and generating meaningful descriptions automatically.
- **Proof-Driven Task Completion:**  
  Users can attach 'proof' images to tasks, making the completion process more engaging and verifiable.
- **Memory Slideshow:**  
  Rather than just a list of completed tasks, the app offers a timeline/slideshow of memories, pairing images, descriptions, and user comments.
- **Hierarchical Organization:**  
  Folders and events allow users to organize data in a more structured and intuitive way.

### d. Technology Stack and Implementation Methods

- **Frontend:**  
  - HTML, CSS, JavaScript (simple interface; ready for ReactJS integration in the future)
- **Backend:**  
  - Python FastAPI for RESTful APIs
  - SQLAlchemy ORM with PostgreSQL for data storage
  - Static file serving for uploads and images
- **AI Integration:**  
  - Tesseract OCR for image-to-text extraction
  - (Extensible for use with OpenAI, Google Vision, etc.)
- **Other:**  
  - CORS enabled for modern frontend frameworks
  - Background tasks for heavy AI processing

### e. Service Architecture & Database structure (when used)

- **Service Architecture:**  
  - RESTful API backend (FastAPI), stateless, supports async operations
  - Background tasks for image analysis (OCR/tagging)
  - Static file server for uploaded files/images
  - Frontend communicates via API (ready for upgrade to ReactJS SPA)
- **Database Structure:**  
  - User, Event, Reminder, Folder, File, Image tables with proper foreign keys and relationships  
  - Images have analyzed text, tags, and comments fields for enhanced memory features

## 🧠 Reflection

### a. If you had more time, what would you expand?

- Implement advanced AI features for semantic image understanding (e.g., activity recognition, emotion detection)
- Develop a mobile app version with camera integration for instant proof capture
- Add calendar and notification integration
- Enhance collaboration features (sharing tasks/memories with friends or teams)
- Improve UI/UX with a modern ReactJS frontend and drag-and-drop file/folder management


### b. If you integrate AI APIs more for your app, what would you do?

- Use generative AI (e.g., OpenAI GPT) to summarize task histories, generate motivational messages, or auto-categorize memories
- Integrate computer vision APIs to recognize activities, people, or locations in images for richer metadata
- Implement predictive scheduling: AI suggests new tasks or reminders based on user habits and detected patterns
- Enable voice-to-text task input and natural language queries


## ✅ Checklist
- [ ] Code runs without errors  
- [ ] All required features implemented (add/edit/delete/complete tasks)  
- [ ] All ✍️ sections are filled  
