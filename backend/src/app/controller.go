package app

import "log"

func Controller(wsUnsent      chan UnsentMessage,
		wsPR          chan PushRegistration,
		wsMessageLoad chan MessageLoadRequest,
		wsSend        chan MessageChannel,
		pnPush        chan PushMessage) {

	// Set up some channels
	msgDbQuery  := make(chan MessageLoadRequest, 200)
	pushDbQuery := make(chan UnsentMessage, 200)
	msgDbStore  := make(chan UnsentMessage, 200)
	pushDbStore := make(chan PushRegistration, 200)

	// Set up the databases
	go messageDb(wsSend, msgDbQuery, msgDbStore)
	go pushDb(pnPush, pushDbQuery, pushDbStore)

	// Deal with all the data
	for{
		select {
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

func messageDb(savedMessages chan MessageChannel,
	 query chan MessageLoadRequest,
	 in    chan UnsentMessage){

	messages := make([]Message, 0)

	for{
		select{
			case message := <-in:
				messages = append(messages, message.Message)
			case req := <-query:
				// Move into goroutine
				x := req.LastSeenId + 1
				messageChannel := make(chan Message, 200)
				messageStruct := MessageChannel{messageChannel, req.User} 
				savedMessages <- messageStruct
				go getMessages(messages[x:], messageChannel)
		}
	}
}

func getMessages(messages []Message, out chan Message){
	for _, m := range messages {
		out <- m
	}
}


func pushDb(pusher chan PushMessage,
	 messagesToPush chan UnsentMessage,
	 newRegistrations chan PushRegistration){

	pushRegs := make(map[uint64]PushRegistration)

	for {
		select {
			case pushReg := <-newRegistrations:
				pushRegs[pushReg.User] = pushReg
			case pushQuery := <-messagesToPush:
				users := pushQuery.SentTo
				m := pushQuery.Message
				pushMessages(users, pushRegs, m, pusher)
		}
	}
}

func pushMessages(pushTo []uint64,
		  db map[uint64]PushRegistration,
		  message Message,
		  pusher chan PushMessage){
		  	log.Println("searching for users to push to")

	pushUsers := make([]PushRegistration, 0)

	for userKey := range db {
		pushUsers = append(pushUsers, db[userKey])
	}

	pushMessage := PushMessage{message, pushUsers}
	log.Println(pushMessage)
	pusher <-pushMessage
}
