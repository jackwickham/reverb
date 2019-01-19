package main

import (
	"app"
	"fmt"
)

func main() {
	newMessageChannel := make(chan app.UnsentMessage)
	pushRegistrationChannel := make(chan app.PushRegistration)
	getMessagesChannel := make(chan app.MessageLoadRequest)
	sendMessagesChannel := make(chan app.Message)
	pushMessagesChannel := make(chan app.PushMessage)

	go app.Api(newMessageChannel, pushRegistrationChannel, getMessagesChannel)

	go app.Controller(newMessageChannel, pushRegistrationChannel, getMessagesChannel, sendMessagesChannel, pushMessagesChannel)

	// Wait forever
	for {
		select {
			case m := <- newMessageChannel:
				fmt.Printf("Processed %s", m)
		}
	}
}
