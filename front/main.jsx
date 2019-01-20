const ADJECTIVES = [ 'fun', 'sad', 'happy', 'basic', 'large', 'important', 'different', 'available', 'popular', 'able', 'hot', 'scared', 'old', 'healthy', 'traditional', 'strong', 'successful', 'nyan' ];
const NOUNS = [ 'horse', 'cat', 'dog', 'giraffe', 'book', 'business', 'child', 'country', 'eyeball', 'fact', 'hand', 'seaman', 'student', 'person', 'thing', 'family', 'group', 'prime-minster', 'pig', ];

function generateName() {
    return `${randFrom(ADJECTIVES)}-${randFrom(ADJECTIVES)}-${randFrom(NOUNS)}`;
}

function getLocalStorageOrDefault(key, defaultGenerator) {
    let value = localStorage.getItem(key);
    if (value == null) {
        value = defaultGenerator();
        localStorage.setItem(key, value);
    }
    return value;
}

function getRandomInt() {
    return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
}
function randFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
} 

class App extends React.Component {
    constructor(props) {
        super(props);

        let userId = getLocalStorageOrDefault("userId", getRandomInt)
        let username = getLocalStorageOrDefault("username", generateName)
        let socket = new WebSocket(`ws://${window.location.host}/websocket?userId=${userId}`);

        this.state = {
            username: username,
            userId: userId,
            messages: [],
            socket: socket
        }

        socket.addEventListener("message", ev => {
            let msg = JSON.parse(ev.data);
            this.setState({
                messages: [...this.state.messages, msg]
            });
        });
    }

    sendMessage(msg) {
        this.state.socket.send(JSON.stringify({
            sender: this.state.userId,
            username: this.state.username,
            body: msg
        }));
    }

    render() {
        return (
            <div className="pannel">
                <Title username={this.state.username} />
                <MessagesContainer messages={this.state.messages} userId={this.state.userId} />
                <SendBox send={this.sendMessage.bind(this)} />
            </div>
        )
    }
}

class Title extends React.Component {
    render() {
        return (
            <div>
                <h1>Reverb</h1>
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
        if (msg.sender == this.props.userId) {
            by = "you";
            fromUs = true;
        } else {
            by = msg.senderName;
            fromUs = false;
        }

        return (
            <div className={fromUs ? "msg-right" : "msg-left"}>
                <div className="msg-body">{msg.body}</div>
                <div className="msg-by">{by}</div>
            </div>
        );
    }
}

class SendBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ""
        }
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit.bind(this)} className="send-box-container">
                <textarea value={this.state.value} onChange={this.handleChange.bind(this)} className="send-box" autofocus></textarea>
                <input type="submit" value="Send" className="send-button"></input>
            </form>
        );
    }

    handleSubmit(event) {
        if (this.state.value) {
            this.props.send(this.state.value);
            this.setState({
                value: ""
            });
        }
        event.preventDefault();
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }
}

const domContainer = document.getElementById('root');
ReactDOM.render(<App/>, domContainer);
