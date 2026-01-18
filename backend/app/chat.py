import os
import json
from openai import OpenAI
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Literal

router = APIRouter()

class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    message: str
    level: str = "beginner"
    history: List[ChatTurn] = []

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

FUNCTIONS = [
    {
        "name": "astroguide_response",
        "description": "Return a structured astronomy answer with sources",
        "parameters": {
            "type": "object",
            "properties": {
                "answer": {
                    "type": "string",
                    "description": "The main answer to the user's question"
                },
                "sources": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "description": "A valid https URL"
                    }
                }
            },
            "required": ["answer", "sources"]
        }
    }
]

def generate_space_answer_with_sources(
    message: str,
    level: str,
    history: List[ChatTurn]
) -> dict:
    messages = [
        {
            "role": "system",
            "content": (
                "You are AstroGuide, an expert space and astronomy tutor.\n\n"
                "Rules:\n"
                "1. Only answer questions related to space or astronomy.\n"
                "2. If the question is NOT about space or astronomy, say:\n"
                "   'I specialize in space and astronomy questions. Please ask something realted to space.'\n"
                "3. Adjust your explanation based on the user's level:\n"
                "   - beginner: simple, intuitive, minimal jargon\n"
                "   - advanced: more technical, precise terminology \n\n"
                "After answering, include 2-3 reputable sources in the 'sources' field.\n"
                "Each source must be a full https URL to a reliable site\n"
                "(e.g., NASA, ESA, HubbleSite, major observatories).\n"
                "If no appropriate sources exist, return an empty array.\n\n"
                "You must respond by calling the function with structured data"
            )
        }
    ]

    MAX_TURNS = 10
    for turn in history[-MAX_TURNS:]:
        if turn.content.strip():
            messages.append({
                "role": turn.role,
                "content": turn.content
            })

    messages.append({
        "role": "user",
        "content": f"Level: {level}\nQuestion: {message}"
    })

    response = client.chat.completions.create(
        model = "gpt-4o-mini",
        messages = messages,
        functions = FUNCTIONS,
        function_call = {"name": "astroguide_response"},
        temperature = 0.2,
    )
    
    try:
        function_args = response.choices[0].message.function_call.arguments
        parsed = json.loads(function_args)
        
        return {
            "answer": parsed["answer"].strip(),
            "sources": parsed["sources"],
        }
    
    except Exception:
        return {
            "answer": "I'm unable to answer that right now.",
            "sources": [],
        }

@router.post("/chat")
def chat(req: ChatRequest):
    return generate_space_answer_with_sources(
        req.message,
        req.level,
        req.history
    )
