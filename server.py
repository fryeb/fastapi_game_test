import asyncio
import uuid

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel
from typing import Dict

class Game(BaseModel):
    name: str

games: Dict[uuid.UUID, Game] = dict()

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

@app.get("/status")
async def get_status():
    return ({'status': 'running'})


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {'request': request})


@app.post("/")
async def create_game(request: Request, response_class=RedirectResponse):
    print("creating game")
    game_id = uuid.uuid4()
    games[game_id] = Game(name=f'Game ({game_id})')
    return RedirectResponse(f'/game/{game_id}', status_code=303)


@app.get("/game/{game_id}", response_class=HTMLResponse)
async def get_game(request: Request, game_id: str):
    game = games[uuid.UUID(game_id)]
    return templates.TemplateResponse("game.html", {'request': request})
