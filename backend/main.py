from fastapi import FastAPI, Request 
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field 
from openai import OpenAI 
import json
import os
from dotenv import load_dotenv
import wikipedia
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["POST"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ComparisonRequest(BaseModel):
    player1: str = Field(..., min_length=1, max_length=50)
    player2: str = Field(..., min_length=1, max_length=50)

def get_player_image(name):
    try:
        clean_name = "".join(char for char in name if char.isalnum() or char.isspace())
        page = wikipedia.page(clean_name, auto_suggest=False)
        return page.images[0] if page.images else "https://via.placeholder.com/150"
    except:
        return "https://via.placeholder.com/150"

@app.post("/compare")
@limiter.limit("5/minute")
async def compare(request: Request, req: ComparisonRequest):

    p1 = req.player1.replace('"', '').strip()
    p2 = req.player2.replace('"', '').strip()

    prompt = f"""
    Compare {req.player1} and {req.player2}. 
    Return ONLY a JSON object with these keys:
    "verdict": (A 2-3 sentence professional scouting summary)
    "p1_info": (Object with keys: "age", "club", "value", "foot")
    "p2_info": (object with keys: "age", "club", "value", "foot")
    "p1_traits": {{"strengths": [], "weaknesses": []}} (List 3 each)
    "p2_traits": {{"strengths": [], "weaknesses" []}} (List 3 each)
    "p1_stats": (Object with 6 key attributes like Pace, Shooting, etc., and integer values 1-100)
    "p2_stats": (Object with the SAME 6 key attributes as p1_stats and integer values 1-100)
    """


    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={ "type": "json_object" }
        )

        data = json.loads(response.choices[0].message.content)

        data["p1_image"] = get_player_image(req.player1)
        data["p2_image"] = get_player_image(req.player2)

        return data
    except Exception as e:
        print(f"Error: {e}")
        return {"verdict": "Scouting failed.", "p1_stats": {}, "p2_stats": {}}

