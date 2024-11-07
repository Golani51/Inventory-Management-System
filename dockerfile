# Use a Python image
FROM python:3.9

# Set the working directory
WORKDIR /app

# Copy requirements.txt from the backend folder and install dependencies
COPY backend/requirements.txt /app/
RUN pip install -r requirements.txt

# Copy the rest of the backend application files
COPY backend/ /app

# Copy the frontend directory
COPY frontend/ /app/frontend

# Expose the Flask port
EXPOSE 4000

# Run the Flask application
CMD ["flask", "run", "--host=0.0.0.0", "--port=4000"]