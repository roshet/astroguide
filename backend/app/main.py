from fastapi import FastAPI
from app.chat import router as chat_router

app = FastAPI(title = "AstroGuide API")
app.include_router(chat_router)

@app.get("/")
def root():
    return {"status": "ok", "message": "AstroGuide backend is running"}