package app

type UnsentMessage struct {
	Message Message
	SentTo []uint64
}

type PushRegistration struct {
	User uint64 `json:"userId"`
	Endpoint string `json:"endpoint"`
	Keys struct{
		Auth string `json:"auth"`
		P256dh string `json:"p256dh"`
	} `json:"keys"`
}

type MessageLoadRequest struct {
	LastSeenId uint64
}

type Message struct {
	Sender uint64 `json:"sender"`
	Id uint64 `json:"id"`
	SenderName string `json:"senderName"`
	Body string `json:"body"`
}

type PushMessage struct {
	Message Message
	To []PushRegistration
}
