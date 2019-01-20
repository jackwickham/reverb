package main

import (
	"app"
)

func main() {
	newMessageChannel := make(chan app.UnsentMessage, 200)
	pushRegistrationChannel := make(chan app.PushRegistration, 200)
	getMessagesChannel := make(chan app.MessageLoadRequest, 200)
	sendMessagesChannel := make(chan app.Message, 200)
	pushMessagesChannel := make(chan app.PushMessage, 200)

	go app.Api(newMessageChannel, pushRegistrationChannel, getMessagesChannel)

	go app.Controller(newMessageChannel, pushRegistrationChannel, getMessagesChannel, sendMessagesChannel, pushMessagesChannel)

	go app.Webpush(pushMessagesChannel)

	// Wait forever
	for {
		select { }
	}
}
