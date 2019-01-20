package app

import (
	"encoding/json"
	"github.com/SherClockHolmes/webpush-go"
	"log"
	"os"
)

func Webpush(pushMessagesChannel chan PushMessage) {
	for {
		msg := <- pushMessagesChannel
		body, err := json.Marshal(msg.Message)
		if err != nil {
			log.Fatal("Json decode failed", err)
			continue
		}
		log.Printf("Pushing %s", body)
		for i := range msg.To {
			log.Printf(" - to %s", msg.To[i])
			push(msg.To[i], body)
		}
	}
}

func push(registration PushRegistration, message []byte) {
	subscription := webpush.Subscription{
		Endpoint: registration.Endpoint,
		Keys: registration.Keys,
	}

	res, err := webpush.SendNotification(message, &subscription, &webpush.Options{
		Subscriber: "jack@jackw.net",
		VAPIDPrivateKey: os.Getenv("PUSH_SERVER_KEY"),
	})

	if err != nil {
		log.Fatal(err)
	}
	log.Println(res)
}