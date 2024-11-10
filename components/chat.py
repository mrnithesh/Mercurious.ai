import streamlit as st
import google.generativeai as genai
from typing import List, Dict
from config import GEMINI_API_KEY, MODEL_CONFIG

class ChatEngine:
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(MODEL_CONFIG["gemini_model"])
        self.context = []

    def process_message(self, message: str, context: List[Dict] = None) -> str:
        if context:
            self.context = context[-5:]  
        
        prompt = self._build_prompt(message)
        response = self.model.generate_content(prompt)
        
        return response.text

    def _build_prompt(self, message: str) -> str:
        context_str = "\n".join([
            f"{msg['role']}: {msg['content']}" 
            for msg in self.context
        ])
        
        return f"""Context: {context_str}

User message: {message}

Please provide a helpful and informative response. Consider the context of previous
messages and any relevant learning materials. Focus on enhancing the user's
understanding of the topic."""

    def clear_context(self) -> None:
        self.context = []

    def add_context(self, role: str, content: str) -> None:
        self.context.append({"role": role, "content": content}) 