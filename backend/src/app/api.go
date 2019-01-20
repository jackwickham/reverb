package app

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"strconv"
	"sync/atomic"
)

type App struct {
	newMsgChannel chan UnsentMessage
	pushRegistrationChannel chan PushRegistration
	getMessagesChannel chan MessageLoadRequest
}

type IncomingMessage struct {
	SenderName string `json:"username"`
	Body string `json:"body"`
}

var upgrader = websocket.Upgrader{}
var lastId uint64 = 0
var sockets = make(map[uint64]*websocket.Conn)
var receiveBuffer = make(chan Message, 200)

func Api(newMsgChannel chan UnsentMessage, pushRegistrationChannel chan PushRegistration, getMessagesChannel chan MessageLoadRequest) {
	app := &App{newMsgChannel, pushRegistrationChannel, getMessagesChannel}
	
	http.HandleFunc("/api/sms", app.handleSMS)
	http.HandleFunc("/api/newMessage", app.handleNewMessageHttp)
	http.HandleFunc("/websocket", app.handleWebsocketConnect)
	fs := http.FileServer(http.Dir("../front"))
	http.Handle("/", fs)

	go app.handleMessage()

	log.Fatal(http.ListenAndServe(":8080", nil))
}

func (a *App) handleSMS(w http.ResponseWriter, r *http.Request) {
	log.Println("Received SMS webhook")
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	err := r.ParseForm()
	if err != nil {
		log.Println("SMS webhook ", err)
		http.Error(w, "failed", 500)
		return
	}

	form := r.PostForm

	messageId := atomic.AddUint64(&lastId, 1)
	message := Message{
		0,
		messageId,
		form.Get("From"),
		form.Get("Body"),
	}

	receiveBuffer <- message 
}

func (a *App) handleNewMessageHttp(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var msg IncomingMessage
	err := decoder.Decode(&msg)
	if err != nil {
		log.Println(err)
		http.Error(w, "Invalid request body", 400)
		return
	}

	messageId := atomic.AddUint64(&lastId, 1)

	message := Message{
		0,
		messageId,
		msg.SenderName,
		msg.Body,
	}

	receiveBuffer <- message
}

func (a *App) handleWebsocketConnect(w http.ResponseWriter, r *http.Request) {
	userId, err := strconv.ParseUint(r.URL.Query().Get("userId"), 10, 64)
	if err != nil {
		log.Println(err)
		http.Error(w, "missing user ID", 400)
		return
	}
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	// Make sure we close the connection when the function returns
	defer ws.Close()

	sockets[userId] = ws

	for {
		var msg IncomingMessage
		// Read in a new message as JSON and map it to a Message object
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			delete(sockets, userId)
			break
		}
		fmt.Println(msg)

		messageId := atomic.AddUint64(&lastId, 1)

		message := Message{
			userId,
			messageId,
			msg.SenderName,
			msg.Body,
		}

		receiveBuffer <- message
	}
}

func (a *App) handleMessage() {
	for {
		msg := <- receiveBuffer
		sentTo := make([]uint64, len(sockets))
		for k, v := range sockets {
			err := v.WriteJSON(msg)
			if err != nil {
				log.Printf("error %v\n", err)
				v.Close()
				delete(sockets, k)
			} else {
				sentTo = append(sentTo, k)
			}
		}
		a.newMsgChannel <- UnsentMessage{msg, sentTo}
	}
}
