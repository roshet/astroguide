# AstroGuide Backend

This directory contains the backend service for AstroGuide, built using FastAPI.

The backend exposes a single chat endpoint that receives user messages and returns AI-generated astronomy responses.

The service is intentionally minimal and focused on clarity and correctness.

---

## Tech Stack

- Python
- FastAPI
- OpenAI API
- Railway (deployment)

---

## Project Structure

```
backend/
├── app/
│   ├── main.py   # FastAPI app entry point and routing
│   └── chat.py   # Chat logic and OpenAI integration
├── requirements.txt
├── runtime.txt
└── README.md
```

---

## Running Locally

Install dependencies:

```bash
pip install -r requirements.txt
```

Set required environment variables:

```bash
export OPENAI_API_KEY=your_api_key_here
```

Start the development server:

```bash
uvicorn app.main:app --reload
```

---

## Deployment

The backend is deployed using Railway.

Deployment is handled automatically using:
- `requirements.txt`
- `runtime.txt`

No additional configuration files are required.

---

## Notes

- The backend is intentionally minimal
- All core logic lives in `chat.py`
- The API is public-facing and designed for read-only usage