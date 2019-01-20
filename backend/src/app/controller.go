package app

import (
	"log"
)

func Controller(wsUnsent      chan UnsentMessage,
		wsPR          chan PushRegistration,
		wsMessageLoad chan MessageLoadRequest,
		pnPush        chan PushMessage) {

	// Set up some channels
	msgDbQuery  := make(chan MessageLoadRequest, 200)
	pushDbQuery := make(chan UnsentMessage, 200)
	msgDbStore  := make(chan UnsentMessage, 200)
	pushDbStore := make(chan PushRegistration, 200)

	// Set up the databases
	go messageDb(msgDbQuery, msgDbStore)
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

func messageDb(query chan MessageLoadRequest,
	in chan UnsentMessage){

	messages := make([]Message, 0)

	for{
		select{
			case message := <-in:
				messages = append(messages, message.Message)
			case req := <-query:
				x := req.LastSeenId + 1
				if x > 1 {
					req.Channel <- messages[x:]
				} else {
					req.Channel <- messages
				}
		}
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

	/*args := []string{"node", "../alexa/notify/index.js", message.SenderName}
	binary, lookErr := exec.LookPath("node")
	if (lookErr != nil){
		return
	}
	execErr := syscall.Exec(binary, args, os.Environ())
	if execErr != nil {
		return
	}*/
}
