import streamlit as st
import yt_dlp
import speech_recognition as sr
from pydub import AudioSegment
import os
import tempfile

def download_audio(video_url):
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
            'preferredquality': '192',
        }],
        'outtmpl': '%(id)s.%(ext)s',
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(video_url, download=True)
            return f"{info['id']}.wav"
        except Exception as e:
            st.error(f"An error occurred while downloading the video: {str(e)}")
            return None

def transcribe_audio(audio_path):
    recognizer = sr.Recognizer()
    transcript = ""

    audio = AudioSegment.from_wav(audio_path)
    chunk_length_ms = 60000  # 1 minute
    chunks = [audio[i:i+chunk_length_ms] for i in range(0, len(audio), chunk_length_ms)]

    for i, chunk in enumerate(chunks):
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
            chunk.export(temp_audio.name, format="wav")
            with sr.AudioFile(temp_audio.name) as source:
                audio_data = recognizer.record(source)
                try:
                    text = recognizer.recognize_google(audio_data)
                    transcript += text + " "
                except sr.UnknownValueError:
                    st.warning(f"Could not understand audio in chunk {i+1}")
                except sr.RequestError as e:
                    st.error(f"Could not request results from Google Speech Recognition service; {e}")
        os.unlink(temp_audio.name)

    return transcript

def main():
    st.title("YouTube Video Transcript Generator")
    st.write("This app generates transcripts for YouTube videos, even if they don't have captions.")

    video_url = st.text_input("Enter the YouTube video URL:")

    if st.button("Generate Transcript"):
        if video_url:
            try:
                with st.spinner("Downloading audio..."):
                    audio_file = download_audio(video_url)
                    if audio_file is None:
                        return

                with st.spinner("Transcribing audio..."):
                    transcript = transcribe_audio(audio_file)

                st.subheader("Generated Transcript:")
                st.text_area("Transcript", transcript, height=300)

                # Clean up temporary files
                os.remove(audio_file)
            except Exception as e:
                st.error(f"An error occurred: {str(e)}")
        else:
            st.warning("Please enter a valid YouTube video URL.")

if __name__ == "__main__":
    main()