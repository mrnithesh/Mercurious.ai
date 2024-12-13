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
ENV PORT=8080

# Expose port
EXPOSE 8080

# Command to run the application
CMD streamlit run main.py --server.port $PORT --server.address 0.0.0.0 