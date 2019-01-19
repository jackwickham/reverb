package messages

type UnsentMessage struct {
	message Message
	sentTo []uint64
}

type PushRegistration struct {
	user uint64

}

type MessageLoadRequest struct {
	lastSeenId uint64
}

type Message struct {
	sender uint64
	id uint64
	senderName string
	body string
}

type PushMessage struct {
	message Message
	to []PushRegistration
}
