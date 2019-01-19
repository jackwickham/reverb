package app

type UnsentMessage struct {
	Message Message
	SentTo []uint64
}

type PushRegistration struct {
	User uint64

}

type MessageLoadRequest struct {
	LastSeenId uint64
}

type Message struct {
	Sender uint64
	Id uint64
	SenderName string
	Body string
}

type PushMessage struct {
	Message Message
	To []PushRegistration
}
