FROM python:3.11-slim

WORKDIR /app

# Install deps first so this layer is cached unless requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# SQLite file and uploaded admin photos/videos each live in their own
# dedicated folder so they can be mounted as volumes (see docker-compose.yml)
# and survive container rebuilds.
RUN mkdir -p /app/data /app/uploads
ENV DATABASE_URL=sqlite:////app/data/forest_haven.db
ENV UPLOAD_DIR=/app/uploads

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
