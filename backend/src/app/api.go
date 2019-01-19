package app

import (
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"sync/atomic"
)

type App struct {
	newMsgChannel chan UnsentMessage
	pushRegistrationChannel chan PushRegistration
	getMessagesChannel chan MessageLoadRequest
}

var upgrader = websocket.Upgrader{}
var lastId uint64 = 0

func Api(newMsgChannel chan UnsentMessage, pushRegistrationChannel chan PushRegistration, getMessagesChannel chan MessageLoadRequest) {
	app := &App{newMsgChannel, pushRegistrationChannel, getMessagesChannel}

	http.HandleFunc("/api/newMessage", app.handleNewMessageHttp)
	http.HandleFunc("/websocket", app.handleWebsocketConnect)

	log.Fatal(http.ListenAndServe(":8080", nil))
}

func (a *App) handleNewMessageHttp(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello %s", r.URL.Path[1:])
}

func (a *App) handleWebsocketConnect(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	// Make sure we close the connection when the function returns
	defer ws.Close()

	for {
		var msg IncomingMessage
		// Read in a new message as JSON and map it to a Message object
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			break
		}
		fmt.Println(msg)

		messageId := atomic.AddUint64(&lastId, 1)

		upstreamMessage := UnsentMessage{Message{
			msg.Sender,
			messageId,
			msg.SenderName,
			msg.Body,
		}, make([]uint64, 0)}

		a.newMsgChannel <- upstreamMessage
	}
}