from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel 
from openai import OpenAI 
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)



class ComparisonRequest(BaseModel):
    player1: str
    player2: str

@app.post("/compare")
async def compare(req: ComparisonRequest):
    # this what we send the AI???? okay lets try......
    prompt = f"You are a football scout. Compare {req.player1} and {req.player2} in a brief report. Return ONLY a JSON with keys: 'verdict' and 'stats' (pace, shooting, passing for both players 1-100)."

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={ "type": "json_object" }
    )
    return json.loads(response.choices[0].message.content)

    