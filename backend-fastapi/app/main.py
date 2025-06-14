from fastapi import FastAPI
from .scheduler import start_scheduler

app = FastAPI()

@app.get("/api/fastapi-health")
def health():
    return {"status": "FastAPI microservice running!"}

# Start APScheduler on FastAPI startup
@app.on_event("startup")
def startup_event():
    start_scheduler()
