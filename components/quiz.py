from typing import List, Dict
import google.generativeai as genai
from config import GEMINI_API_KEY, MODEL_CONFIG

class QuizGenerator:
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(MODEL_CONFIG["gemini_model"])

    def generate_quiz(self, content: str, num_questions: int = 5) -> List[Dict]:
        prompt = self._build_quiz_prompt(content, num_questions)
        response = self.model.generate_content(prompt)
        return self._parse_quiz_response(response.text)

    def _build_quiz_prompt(self, content: str, num_questions: int) -> str:
        return f"""Generate {num_questions} multiple choice questions based on this content:
        {content[:2000]}...

        Format each question as:
        Question: [question text]
        A) [option]
        B) [option]
        C) [option]
        D) [option]
        Correct: [A/B/C/D]

        Make sure questions test understanding rather than just recall."""

    def _parse_quiz_response(self, response: str) -> List[Dict]:
        questions = []
        current_question = {}
        
        for line in response.split('\n'):
            if line.startswith('Question:'):
                if current_question:
                    questions.append(current_question)
                current_question = {'question': line[9:].strip(), 'options': []}
            elif line.startswith(('A)', 'B)', 'C)', 'D)')):
                current_question['options'].append(line[3:].strip())
            elif line.startswith('Correct:'):
                current_question['correct'] = line[9:].strip()
        
        if current_question:
            questions.append(current_question)
        
        return questions

    def grade_answer(self, question: Dict, user_answer: str) -> bool:
        correct_index = ord(question['correct']) - ord('A')
        return user_answer == question['options'][correct_index] 