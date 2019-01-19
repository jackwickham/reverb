package app


func Controller(wsUnsent      chan UnsentMessage,
		wsPR          chan PushRegistration,
		wsMessageLoad chan MessageLoadRequest,
		wsSend        chan Message,
		pnPush        chan PushMessage) {

	// Set up some channels
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
				messages = append(messages, message.Message)
			case req := <-query:
				// Move into goroutine
				x := req.LastSeenId + 1
				go getMessages(messages[x:], out)
		}
	}
}

func getMessages(messages []Message, out chan Message){
	for _, m := range messages {
		out <- m
	}
}


func pDB(out   chan PushMessage,
	 query chan UnsentMessage,
	 in    chan PushRegistration){

	pushRegs := make(map[uint64]PushRegistration)

	for{
		select{
			case pushReg := <-in:
				pushRegs[pushReg.User] = pushReg
			case pushQuery := <-query:
				users := pushQuery.SentTo
				m := pushQuery.Message
				go pushMessages(users, pushRegs, m, out)
		}
	}
}

func pushMessages(users []uint64,
		  db map[uint64]PushRegistration,
		  message Message,
		  out chan PushMessage){

	pushUsers := make([]PushRegistration, 0)

	for userKey := range db {
		sendUser := true
		for _, user := range users{
			if user == userKey {
				sendUser = false
			}
		}
		if sendUser {
			pushUsers = append(pushUsers, db[userKey])
		}
	}

	pushMessage := PushMessage{message, pushUsers}
	out <-pushMessage
}
