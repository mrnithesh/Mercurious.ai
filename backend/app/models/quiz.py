from pydantic import BaseModel
from typing import List
from datetime import datetime

class QuizOption(BaseModel):
    text: str
    is_correct: bool

class QuizQuestion(BaseModel):
    question: str
    options: List[str]  
    correct_answer: str
    explanation: str

class QuizGenerateRequest(BaseModel):
    video_id: str
    num_questions: int = 5

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
    video_id: str
    generated_at: datetime

class QuizAnswer(BaseModel):
    question_index: int
    selected_answer: str

class QuizSubmission(BaseModel):
    video_id: str
    answers: List[QuizAnswer]

class QuizResult(BaseModel):
    video_id: str
    score: int
    total_questions: int
    correct_answers: List[int]  # indices of correct answers
    submitted_at: datetime
    time_taken: int  # seconds

class QuizResultResponse(BaseModel):
    result: QuizResult
    questions: List[QuizQuestion]  # Include questions for review
