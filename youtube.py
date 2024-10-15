import streamlit as st
import re
import os
from youtube_transcript_api import YouTubeTranscriptApi
import google.generativeai as genai

# Function to extract video ID from YouTube URL
def extract_video_id(url):
    pattern = r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)'
    match = re.match(pattern, url)
    if match:
        return match.group(1)
    return None

# Function to fetch YouTube transcript
def fetch_youtube_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        text = ' '.join([t['text'] for t in transcript])
        return text
    except Exception as e:
        st.error(f"Error fetching transcript: {e}")
        return None

# Function to generate content using Gemini AI
def generate_content(prompt, api_key):
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    res = model.generate_content(prompt)
    return res.candidates[0].content.parts[0].text

# Function to refine transcript using AI
def refine_transcript(transcript, api_key):
    refine_prompt = f"""
    Please refine the following transcript, correcting any obvious errors in grammar, 
    spelling, or punctuation. Maintain the original meaning and content, but improve 
    clarity and readability:

    {transcript}

    Refined transcript:
    """
    return generate_content(refine_prompt, api_key)

# Streamlit UI
def main():
    st.title("YouTube Video Transcript Analyzer")
    st.write("Enter a YouTube URL to analyze its transcript.")

    # Input for YouTube URL
    video_url = st.text_input("Enter the YouTube video URL:")

    # Fetch API key from environment variable
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        st.error("Google API key not found in environment variables. Please set the GEMINI_API_KEY environment variable.")
        return

    if st.button("Analyze Video"):
        if video_url:
            video_id = extract_video_id(video_url)
            if video_id:
                with st.spinner("Fetching and analyzing transcript..."):
                    original_transcript = fetch_youtube_transcript(video_id)
                    if original_transcript:
                        # Refine the transcript
                        refined_transcript = refine_transcript(original_transcript, api_key)
                        
                        # Create tabs
                        tab1, tab2, tab3, tab4 = st.tabs(["Summary", "Key Concepts", "Refined Transcript", "Original Transcript"])
                        
                        with tab1:
                            st.subheader("Summary")
                            summary_prompt = f"Provide a concise summary of the following transcript: {refined_transcript}"
                            summary = generate_content(summary_prompt, api_key)
                            st.write(summary)
                        
                        with tab2:
                            st.subheader("Key Concepts Discussed")
                            concepts_prompt = f"List and briefly explain the key concepts discussed in the following transcript: {refined_transcript}"
                            key_concepts = generate_content(concepts_prompt, api_key)
                            st.write(key_concepts)
                        
                        with tab3:
                            st.subheader("Refined Transcript")
                            st.text_area("", refined_transcript, height=300)
                        
                        with tab4:
                            st.subheader("Original Transcript")
                            st.text_area("", original_transcript, height=300)
                    else:
                        st.error("Failed to fetch the transcript. The video might not have captions available.")
            else:
                st.error("Invalid YouTube URL. Please enter a valid URL.")
        else:
            st.warning("Please enter a YouTube URL.")

if __name__ == "__main__":
    main()