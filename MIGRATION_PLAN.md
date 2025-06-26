# 📋 **Mercurious.ai Migration Plan: Streamlit → FastAPI + Vanilla JS**

## **Current Application Analysis**

Your Streamlit app `Mercurious.ai` is an AI-powered learning assistant with these core features:

1. **User Authentication** (Firebase Auth)
2. **Video Processing** (YouTube video analysis, transcript extraction)
3. **AI Chat Assistant** (Gemini AI integration)
4. **Quiz Generation** (AI-generated quizzes based on video content)
5. **Progress Tracking** (User progress, notes, bookmarks)
6. **Data Management** (Firebase Firestore)

## **Migration Strategy**

### **Phase 1: Backend Infrastructure Setup**

#### **1.1 FastAPI Application Structure**
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── dependencies.py         # Authentication & DB dependencies
│   ├── middleware.py           # CORS, security middleware
│   ├── models/                 # Pydantic models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── video.py
│   │   ├── chat.py
│   │   └── quiz.py
│   ├── routers/                # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── videos.py
│   │   ├── chat.py
│   │   ├── quiz.py
│   │   └── user.py
│   ├── services/               # Business logic (refactored components)
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── video_service.py
│   │   ├── chat_service.py
│   │   ├── quiz_service.py
│   │   └── data_service.py
│   └── utils/                  # Utilities (transcript, recommendations)
│       ├── __init__.py
│       ├── transcript.py
│       └── recommendations.py
├── requirements.txt
└── Dockerfile
```

#### **1.2 Frontend Structure**
```
frontend/
├── index.html
├── css/
│   ├── main.css
│   ├── components.css
│   └── themes.css
├── js/
│   ├── main.js
│   ├── api.js                  # API client
│   ├── auth.js                 # Authentication
│   ├── components/
│   │   ├── video-player.js
│   │   ├── chat.js
│   │   ├── quiz.js
│   │   ├── navigation.js
│   │   └── progress.js
│   └── utils/
│       ├── storage.js
│       └── helpers.js
├── assets/
│   ├── images/
│   └── icons/
└── pages/
    ├── login.html
    ├── dashboard.html
    ├── video.html
    └── profile.html
```

### **Phase 2: API Design & Implementation**

#### **2.1 Core API Endpoints**

```python
# Authentication
POST   /api/auth/register      # User registration
POST   /api/auth/login         # User login
POST   /api/auth/logout        # User logout
GET    /api/auth/me            # Get current user
POST   /api/auth/refresh       # Refresh token

# Video Management
POST   /api/videos/process     # Process YouTube video
GET    /api/videos/           # Get user's videos
GET    /api/videos/{video_id}  # Get specific video
DELETE /api/videos/{video_id}  # Delete video
PUT    /api/videos/{video_id}/progress  # Update progress

# Chat
POST   /api/chat/message       # Send chat message
GET    /api/chat/history/{video_id}  # Get chat history
DELETE /api/chat/history/{video_id}  # Clear chat history

# Quiz
POST   /api/quiz/generate/{video_id}  # Generate quiz
POST   /api/quiz/submit        # Submit quiz answers
GET    /api/quiz/results/{video_id}  # Get quiz results

# User Data
GET    /api/user/progress      # Get user progress
POST   /api/user/notes         # Save notes
GET    /api/user/notes/{video_id}  # Get notes
PUT    /api/user/settings      # Update settings
```

#### **2.2 Data Models (Pydantic)**

```python
# User Models
class UserBase(BaseModel):
    email: str
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    last_login: datetime

# Video Models
class VideoProcessRequest(BaseModel):
    url: str

class VideoInfo(BaseModel):
    title: str
    author: str
    duration: str
    thumbnail_url: str

class VideoContent(BaseModel):
    transcript: str
    summary: str
    main_points: List[str]
    key_concepts: List[str]
    study_guide: str

class VideoResponse(BaseModel):
    video_id: str
    info: VideoInfo
    content: VideoContent
    progress: float
    created_at: datetime

# Chat Models
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime

class ChatRequest(BaseModel):
    message: str
    video_id: str

# Quiz Models
class QuizOption(BaseModel):
    text: str
    is_correct: bool

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: str

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
    video_id: str
```

### **Phase 3: Component Migration**

#### **3.1 Authentication Service Migration**
```python
# backend/app/services/auth_service.py
from firebase_admin import auth, firestore
from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

class AuthService:
    def __init__(self, db):
        self.db = db
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    async def register_user(self, user_data: UserCreate) -> UserResponse:
        # Migration of your existing register_user logic
        pass
    
    async def authenticate_user(self, email: str, password: str) -> UserResponse:
        # Migration of your existing login_user logic
        pass
    
    async def get_current_user(self, token: str) -> UserResponse:
        # JWT token validation
        pass
```

#### **3.2 Video Service Migration**
```python
# backend/app/services/video_service.py
class VideoService:
    def __init__(self, db):
        self.db = db
        self.transcript_processor = TranscriptProcessor()
    
    async def process_video(self, url: str, user_id: str) -> VideoResponse:
        # Migration of your existing video processing logic
        pass
    
    async def get_user_videos(self, user_id: str) -> List[VideoResponse]:
        # Migration of data_manager video retrieval
        pass
```

### **Phase 4: Frontend Implementation**

#### **4.1 API Client (JavaScript)**
```javascript
// frontend/js/api.js
class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.token = localStorage.getItem('token');
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }
        
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    }
    
    // Auth methods
    async register(userData) { /* ... */ }
    async login(credentials) { /* ... */ }
    async logout() { /* ... */ }
    
    // Video methods
    async processVideo(url) { /* ... */ }
    async getVideos() { /* ... */ }
    
    // Chat methods
    async sendMessage(message, videoId) { /* ... */ }
    
    // Quiz methods
    async generateQuiz(videoId) { /* ... */ }
}
```

#### **4.2 Component System (Vanilla JS)**
```javascript
// frontend/js/components/video-player.js
class VideoPlayer {
    constructor(container) {
        this.container = container;
        this.api = new APIClient();
    }
    
    render(videoData) {
        this.container.innerHTML = this.getTemplate(videoData);
        this.attachEventListeners();
    }
    
    getTemplate(videoData) {
        return `
            <div class="video-player">
                <div class="video-container">
                    <iframe src="${videoData.info.video_url}" frameborder="0"></iframe>
                </div>
                <div class="video-info">
                    <h2>${videoData.info.title}</h2>
                    <p>By: ${videoData.info.author}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${videoData.progress}%"></div>
                    </div>
                </div>
            </div>
        `;
    }
}
```

### **Phase 5: Migration Timeline**

#### **Week 1: Foundation**
- Set up FastAPI project structure
- Migrate configuration and dependencies
- Implement basic authentication endpoints
- Create frontend HTML structure

#### **Week 2: Core Features**
- Migrate video processing service
- Implement video API endpoints
- Create video processing UI
- Basic navigation and routing

#### **Week 3: AI Features**
- Migrate chat functionality
- Implement quiz generation
- Create chat and quiz UI components
- Progress tracking system

#### **Week 4: Polish & Testing**
- UI/UX improvements
- Error handling and validation
- Testing and debugging
- Performance optimization

## **Key Migration Considerations**

### **Dependencies to Add**
```python
# New FastAPI dependencies
fastapi==0.104.1
uvicorn==0.24.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
```

### **Environment Variables**
- Keep existing Firebase and Gemini API keys
- Add JWT secret key for token generation
- Configure CORS origins for frontend

### **Database Changes**
- No changes to Firebase Firestore structure needed
- Session state management will move to frontend localStorage/sessionStorage
- JWT tokens will replace Streamlit session state for authentication

### **UI/UX Considerations**
- Maintain the existing color scheme and branding
- Responsive design for mobile compatibility
- Progressive loading for better user experience
- Error handling and user feedback

## **Testing Strategy**

### **Backend Testing**
- Unit tests for each service class
- API endpoint testing with pytest
- Firebase integration tests
- Load testing for AI API calls

### **Frontend Testing**
- Component testing with manual verification
- Cross-browser compatibility testing
- Mobile responsiveness testing
- User flow testing

## **Deployment Strategy**

### **Backend Deployment**
- Docker containerization
- Environment-specific configuration
- Health checks and monitoring
- Rate limiting and security

### **Frontend Deployment**
- Static file hosting (Netlify, Vercel, or CDN)
- Environment-specific API endpoints
- Progressive Web App (PWA) capabilities

## **Next Steps**

1. **Create FastAPI backend structure**
2. **Migrate authentication system**
3. **Implement video processing endpoints**
4. **Build basic frontend framework**
5. **Progressive feature migration**
6. **Testing and optimization**

---

*This migration plan provides a roadmap for converting the Streamlit application to a modern FastAPI + Vanilla JavaScript web application while maintaining all existing functionality and improving scalability.* 