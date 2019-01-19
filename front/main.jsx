class App extends React.Component {
    constructor() {
        super();

        this.state = {
            username: "this-is-my-username",
            userId: 3,
            messages: [{sender: 3, id: 1, senderName: "person 3", body: "blah blah blah"}, {sender: 5, id: 2, senderName: "person 5", body: "mah body"}]
        }
    }

    render() {
        return (
            <div>
                <Title username={this.state.username} />
                <MessagesContainer messages={this.state.messages} userId={this.state.userId} />
                <SendBox />
            </div>
        )
    }
}

class Title extends React.Component {
    render() {
        return (
            <div>
                <h1>Reverb</h1>
                <p>{this.props.username}</p>
            </div>
        );
    }
}

class MessagesContainer extends React.Component {
    render() {
        let messages = this.props.messages.map(message => <li key={message.id}><Message msg={message} userId={this.props.userId}/></li>);

        return (
            <ul className="messages-container">
                {messages}
            </ul>
        )
    }
}

class Message extends React.Component {
    render() {
        let msg = this.props.msg;
        let by, fromUs;
        if (msg.sender === this.props.userId) {
            by = "you";
            fromUs = true;
        } else {
            by = msg.senderName;
            fromUs = false;
        }

        return (
            <div className={fromUs ? "msg-right" : "msg-left"}>
                <div className="msg-by">{by}</div>
                <div className="msg-body">{msg.body}</div>
            </div>
        );
    }
}

class SendBox extends React.Component {
    render() {
        return (
            <p>Send box coming soon</p>
        );
    }
}

const domContainer = document.getElementById('root');
ReactDOM.render(<App/>, domContainer);
