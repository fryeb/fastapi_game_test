const WORLD_WIDTH = 160;
const WORLD_HEIGHT = 90;
let tile_size = undefined;

let player_name = undefined;
let socket = undefined;
let canvas = document.getElementById('c');
let ctx = null;

let players = {};

function joinGame() {
	player_name = document.querySelector('#player_name').value;
	const host = window.location.host;
	const path = window.location.pathname;

	socket = new WebSocket(`ws://${host}${path}/${player_name}`);
	socket.onmessage = processMessage;
	socket.onopen = function () {
		window.addEventListener('keydown', onKeyDown);
	};
	startGame();
}

function onKeyDown(event) {
	function send(payload) {
		socket.send(JSON.stringify(payload));
	}

	if (event.key == 'w' || event.key == 'k' || event.key == 'ArrowUp') {
		send({'player': player_name, 'action': 'Up'});
	} else if (event.key == 'a' || event.key == 'h' || event.key == 'ArrowLeft') {
		send({'player': player_name, 'action': 'Left'});
	} else if (event.key == 's' || event.key == 'j' || event.key == 'ArrowDown') {
		send({'player': player_name, 'action': 'Down'});
	} else if (event.key == 'd' || event.key == 'l' || event.key == 'ArrowRight') {
		send({'player': player_name, 'action': 'Right'});
	}
}

function processMessage(event) {
	const message = JSON.parse(event.data);
	let player = message['player'];
	let action = message['action'];

	if (action == 'Create') {
		players[player] = {x: WORLD_WIDTH/2, y: WORLD_HEIGHT/2};
	} else if (action == 'Up') {
		players[player].y -= 1;
	} else if (action == 'Left') {
		players[player].x -= 1;
	} else if (action == 'Down') {
		players[player].y += 1;
	} else if (action == 'Right') {
		players[player].x += 1;
	} 
}

function startGame() {
	// CSS Dimensions
	let dpi = window.devicePixelRatio;
	let style_height = 
		+getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
	let style_width =
		+getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);

	// Scale the canvas
	tile_size = Math.round((style_width * dpi) / WORLD_WIDTH);
	canvas.setAttribute('height', WORLD_HEIGHT * tile_size);	
	canvas.setAttribute('width', WORLD_WIDTH * tile_size);

	ctx = canvas.getContext('2d');

	draw();
}

function draw() {
	ctx.fillStyle = '#444444ff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.font = tile_size + "px Arial";
	ctx.fillStyle = "#888";

	for (name in players) {
		player = players[name];
		ctx.fillText(name, player.x * tile_size, player.y * tile_size);
	}

	requestAnimationFrame(draw);
}
