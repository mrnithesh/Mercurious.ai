import requests
from youtube_transcript_api import YouTubeTranscriptApi
import google.generativeai as genai
import os

# Function to fetch YouTube transcript
def fetch_youtube_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        text = ' '.join([t['text'] for t in transcript])
        return text
    except Exception as e:
        print(f"Error fetching transcript: {e}")
        return None

# Function to preprocess text
def preprocess_text(text):
    return text.strip()

# Function to summarize text using Gemini AI
def summarize_with_gemini(text):
    genai.configure(api_key = os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = f"Summarize the following text: {text}"
    res = model.generate_content(prompt)
    response_text = res.candidates[0].content.parts[0].text
    return response_text

# Function to make predictions using Gemini AI
def make_predictions(summary):
    genai.configure(api_key = os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = f"With the following summary of the conversation give me one specific technology that is going to be a blooming field in the future and worth learning it: {summary}"
    res = model.generate_content(prompt)
    predictions = res.candidates[0].content.parts[0].text
    return predictions

# Function to generate a roadmap using Gemini AI
def generate_roadmap(predictions):
    genai.configure(api_key = os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-1.5-flash")
    prompt = f"With the given predicted technology give me a full fledged course curriculum with innnovative projects included with the help of course materials from various edtech platforms like udemy or coursera, do not include fields like machine learning, or deep learning that are already blooming: {predictions}"
    res = model.generate_content(prompt)
    roadmap = res.candidates[0].content.parts[0].text
    return roadmap

# Main function
def main():
    video_id = "L_Guz73e6fw"
    api_endpoint = "https://api.gemini.com/v1/summaries"
    api_key = os.getenv("GEMINI_API_KEY")
    transcript = fetch_youtube_transcript(video_id)
    if transcript:
        processed_text = preprocess_text(transcript)
        summary = summarize_with_gemini(processed_text)
        predicted_fields = make_predictions(summary)
        curriculum = generate_roadmap(predicted_fields)
        print(summary)
        print(predicted_fields)
        print(curriculum)

# Entry point of the script
if __name__ == "__main__":
    main()