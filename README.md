# Mercurious.ai - Your AI Learning Assistant 🎓

An intelligent learning platform that transforms YouTube videos into interactive learning experiences using AI. Built with Streamlit and powered by Google's Gemini AI.

## ✨ Features

- 🔐 Secure Firebase Authentication
- 🎥 YouTube Video Processing
- 🤖 AI-Powered Content Analysis
- 💬 Interactive Chat Assistant
- 📝 Smart Note-Taking
- 📊 Progress Tracking
- 🎯 Automated Quiz Generation
- 📚 Study Guide Creation
- 🌙 Dark/Light Mode Support

## 🛠 Prerequisites

- Python 3.8+
- Firebase Account
- Google Cloud Project
- Google Gemini API Key

## 🔧 Environment Setup

1. Create a `.env` file in the project root:
```env
# Google API Configuration
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLOUD_PROJECT=your_project_id
YOUTUBE_DATA_API="your_api_key"

# Firebase Configuration

FIREBASE_CREDENTIALS_PATH="path_to_credentials"
FIREBASE_API_KEY="your_firebase_api_key"
FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_STORAGE_BUCKET="your-storage-bucket"

```

2. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Cloud Firestore database
   - Download Firebase Admin SDK credentials and save as `firebase-credentials.json`

3. Set up Google Cloud:
   - Create a project at [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Gemini API
   - Enable Youtube Data API
   - Create API credentials and get your API key

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/mrnithesh/Mercurious.ai.git
cd Mercurious.ai
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```


## 🚀 Running the Application

1. Start the Streamlit server:
```bash
streamlit run main.py
```

2. Access the application at `http://localhost:8501`


## 🔒 Security Notes

- Store sensitive credentials in `.env` file
- Never commit `.env` or `firebase-credentials.json`
- Implement rate limiting for API calls
- Regular security audits recommended
- Keep dependencies updated

## 🎯 Usage Examples

1. **Process a YouTube Video**: 
```python
from components.video import VideoHandler

video_handler = VideoHandler()
result = video_handler.process_video("https://youtube.com/watch?v=...")
```

2. **Generate Quiz**:
```python
from components.quiz import QuizGenerator

quiz_gen = QuizGenerator()
quiz = quiz_gen.generate_quiz(video_content)
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the Apache-2.0 license - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

- **Firebase Authentication**: Check Firebase configuration in `.env`
- **API Rate Limits**: Monitor Gemini API usage and implement rate limiting

## 📧Contact

For any queries or further information, feel free to reach out via [LinkedIn](https://www.linkedin.com/in/mrnithesh/) or email at mr.nithesh.k@gmail.com.


