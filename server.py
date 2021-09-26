import uuid

from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from typing import Dict, List


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
    game_id = uuid.uuid4()
    return RedirectResponse(f'/game/{game_id}', status_code=303)


@app.get("/game/{game_id}", response_class=HTMLResponse)
async def get_game(request: Request, game_id: str):
    return templates.TemplateResponse(
        "game.html",
        {'request': request, 'game_id': game_id}
        )


class Game:
    def __init__(self):
        self.sockets: List[WebSocket] = []
        self.messages: List[str] = []

    async def connect(self, socket: WebSocket):
        await socket.accept()
        self.sockets.append(socket)
        for message in self.messages:
            await socket.send_text(message)

    async def broadcast(self, message: str):
        self.messages.append(message)
        # TODO: We should probably await them all at once
        for socket in self.sockets:
            await socket.send_text(message)


games: Dict[uuid.UUID, Game] = dict()


@app.websocket("/game/{game_id}/{player_name}")
async def game_socket(websocket: WebSocket, game_id: str, player_name: str):
    game_uuid = uuid.UUID(game_id)
    if game_uuid not in games:
        games[game_uuid] = Game()

    game = games[game_uuid]
    await game.connect(websocket)
    await game.broadcast(f"new player: {player_name}")
    while True:
        message = await websocket.receive_text()
        await game.broadcast(f"{player_name}: {message}")
