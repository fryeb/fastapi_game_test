let player_name = undefined;
let socket = undefined;

function processMessage(event) {
	let messages = document.querySelector('#messages');
	let message = document.createElement('li');
	let content = document.createTextNode(event.data);
	message.appendChild(content);
	messages.appendChild(message);
}

function joinGame() {
	player_name = document.querySelector('#player_name').value;
	const host = window.location.host;
	const path = window.location.pathname;

	socket = new WebSocket(`ws://${host}${path}/${player_name}`);
	socket.onmessage = processMessage;
}


