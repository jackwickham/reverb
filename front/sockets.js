function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

if(localStorage.getItem("id") === null){
	localStorage.setItem("id", getRandomInt(Math.pow(2, 50)));
}

id = localStorage.getItem("id");
name = "User";

ws = new WebSocket("ws://localhost:8080/websocket?userId=" + id);

//Event listener for the websocket -> just print out for now!
ws.addEventListener("message", ev => console.log(ev));


function sendMessage(message){
	ws.send(JSON.stringify({sender: id, username: name, body: message}));
}
