# Use Python 3.9 slim image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
COPY .env .

# Expose port
EXPOSE 8501

# Command to run the application
CMD ["streamlit", "run", "app.py"]