package main

import (
	"app"
)

func main() {
	newMessageChannel := make(chan app.UnsentMessage)
	pushRegistrationChannel := make(chan app.PushRegistration)
	getMessagesChannel := make(chan app.MessageLoadRequest)

	go app.Api(newMessageChannel, pushRegistrationChannel, getMessagesChannel)

	// Wait forever
	select { }
}
