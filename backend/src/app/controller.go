package app

import (
	"fmt"
)

func Controller(wsUnsent      chan UnsentMessage,
		wsPR          chan PushRegistration,
		wsMessageLoad chan MessageLoadRequest,
		wsSend        chan Message,
		pnPush        chan PushMessage) {

	// Set up some channels
	msgDB       := make(chan Message)
	pushDB      := make(chan PushMessage)
	msgDbQuery  := make(chan MessageLoadRequest)
	pushDbQuery := make(chan UnsentMessage)
	msgDbStore  := make(chan UnsentMessage)
	pushDbStore := make(chan PushRegistration)

	// Set up the databases
	go mDB(wsSend, msgDbQuery, msgDbStore)
	go pDB(pnPush, msgDbStore, pushDbStore)

	// Deal with all the data
	for{
		select{
			case message := <-wsUnsent:
				msgDbStore <- message
				pushDbQuery <- message
			case pushReg := <-wsPR:
				pushDbStore <- pushReg
			case loadReq := <-wsMessageLoad:
				msgDbQuery <- loadReq
		}
	}
}

func mDB(out   chan Message,
	 query chan MessageLoadRequest,
	 in    chan UnsentMessage){
	messages := make([]Message, 0)

	for{
		select{
			case message := <-in:
				messages = append(messages, message.message)
			case req := <-query:
				x := req.lastSeenId + 1
				for _, m := range messages[x:] {
					out <- m
				}
		}
	}
}

func pDB(out   chan PushMessage,
	 query chan UnsentMessage,
	 in    chan PushRegistration){
	for{
		select{
			case pushReg := <-in:
				//Store the registration
			case message := <-query:
				// send the push requests
		}
	}
}
