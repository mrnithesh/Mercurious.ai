import streamlit as st
import re
import os
from youtube_transcript_api import YouTubeTranscriptApi
import google.generativeai as genai

# Extract video ID from YouTube URL
def extract_video_id(url):
    pattern = r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)'
    match = re.match(pattern, url)
    if match:
        return match.group(1)
    return None

# Fetch YouTube transcript
def fetch_youtube_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        text = ' '.join([t['text'] for t in transcript])
        return text
    except Exception as e:
        st.error(f"Error fetching transcript: {e}")
        return None

# Generate content using Gemini AI
def generate_content(prompt, api_key):
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    res = model.generate_content(prompt)
    return res.candidates[0].content.parts[0].text

# Refine transcript using AI
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
    # Page setup
    st.set_page_config(page_title="Mercuirous.ai - AI-Powered Learning Platform", layout="wide", page_icon="🎓")

    st.markdown(
        """
        <style>
            .main-title {
                font-size: 2.5em;
                color: #3a4b7d;
                text-align: center;
                font-weight: bold;
                margin-bottom: 0.5em;
            }
            .sub-title {
                font-size: 1.2em;
                color: #7d88a1;
                text-align: center;
                margin-bottom: 1em;
            }
            .instruction {
                font-size: 1.1em;
                color: #4f5d75;
                margin-bottom: 1em;
                text-align: center;
            }
            .summary-box, .concepts-box, .refined-box, .original-box {
                background-color: #f5f7fb;
                padding: 1em;
                border-radius: 8px;
                margin-bottom: 1em;
                font-family: Arial, sans-serif;
                font-size: 1em;
            }
        </style>
        """,
        unsafe_allow_html=True,
    )

    # Main title and description
    st.markdown('<div class="main-title">Mercurious.ai - AI-Powered Learning Platform</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Enhance your learning from YouTube videos and PDF documents with AI-powered summaries, key concepts, and personalized quizzes</div>', unsafe_allow_html=True)
    st.markdown('<div class="instruction">Enter a YouTube URL to analyze its content, generate a summary, and extract key concepts</div>', unsafe_allow_html=True)

    # Content input
    with st.form(key="analyze_form"):
        video_url = st.text_input("Enter the YouTube video URL:")
        submit_button = st.form_submit_button("Analyze Video")

    # Fetch API key from environment variable
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        st.error("Google API key not found in environment variables. Please set the GEMINI_API_KEY environment variable.")
        return

    if submit_button:
        if video_url:
            video_id = extract_video_id(video_url)
            if video_id:
                with st.spinner("Fetching and analyzing transcript..."):
                    original_transcript = fetch_youtube_transcript(video_id)
                    if original_transcript:
                        # Refine the transcript
                        refined_transcript = refine_transcript(original_transcript, api_key)

                        # Tabs layout
                        tab1, tab2, tab3, tab4 = st.tabs(["📄 Summary", "📌 Key Concepts", "📝 Refined Transcript", "📃 Original Transcript"])

                        with tab1:
                            st.subheader("Summary")
                            summary_prompt = f"Provide a concise summary of the following transcript: {refined_transcript}"
                            summary = generate_content(summary_prompt, api_key)
                            st.markdown(f'<div class="summary-box">{summary}</div>', unsafe_allow_html=True)

                        with tab2:
                            st.subheader("Key Concepts Discussed")
                            concepts_prompt = f"List and briefly explain the key concepts discussed in the following transcript: {refined_transcript}"
                            key_concepts = generate_content(concepts_prompt, api_key)
                            st.markdown(f'<div class="concepts-box">{key_concepts}</div>', unsafe_allow_html=True)

                        with tab3:
                            st.subheader("Refined Transcript")
                            st.markdown(f'<div class="refined-box">{refined_transcript}</div>', unsafe_allow_html=True)

                        with tab4:
                            st.subheader("Original Transcript")
                            st.markdown(f'<div class="original-box">{original_transcript}</div>', unsafe_allow_html=True)
                    else:
                        st.error("Failed to fetch the transcript. The video might not have captions available.")
            else:
                st.error("Invalid YouTube URL. Please enter a valid URL.")
        else:
            st.warning("Please enter a YouTube URL.")

if __name__ == "__main__":
    main()
