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

        Follow these guidelines:
        1. Questions should directly test understanding of the video content
        2. Each question should focus on a specific concept or point from the video
        3. Include questions that test different levels of understanding (recall, comprehension, application)
        4. Make sure all options are plausible but only one is clearly correct
        5. Avoid overly general or vague questions
        6. Base questions on the actual content, not assumptions or external knowledge

        Format each question as:
        Question: [question text]
        A) [option]
        B) [option]
        C) [option]
        D) [option]
        Correct: [A/B/C/D]

        Make sure each question:
        - Is clear and unambiguous
        - Has exactly one correct answer
        - Tests understanding of the video content
        - Is relevant to the main points discussed"""

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