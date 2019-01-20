const ADJECTIVES = [ 'fun', 'sad', 'happy', 'basic', 'large', 'important', 'different', 'available', 'popular', 'able', 'hot', 'scared', 'old', 'healthy', 'traditional', 'strong', 'successful', 'nyan' ];
const NOUNS = [ 'horse', 'cat', 'dog', 'giraffe', 'book', 'business', 'child', 'country', 'eyeball', 'fact', 'hand', 'seaman', 'student', 'person', 'thing', 'family', 'group', 'prime-minster', 'pig', ];

function generateName() {
    return `${randFrom(ADJECTIVES)}-${randFrom(ADJECTIVES)}-${randFrom(NOUNS)}`;
}

function getLocalStorageOrDefault(key, defaultGenerator) {
    let value = localStorage.getItem(key);
    console.log(value);
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
        let notifications = true;//getLocalStorageOrDefault("notifications", () => "false") === "false";
        let protocol = window.location.protocol === "https:" ? "wss" : "ws";
        let socket = new WebSocket(`${protocol}://${window.location.host}/websocket?userId=${userId}`);

        this.state = {
            username: username,
            userId: userId,
            messages: [],
            socket: socket,
            notifications: notifications,
            registration: null
        }

        socket.addEventListener("message", ev => {
            let msg = JSON.parse(ev.data);
            this.setState({
                messages: [...this.state.messages, msg]
            });
        });

        let prom = this.setUpServiceWorker();
        let self = this;
        if (notifications) {
            prom.then(self.enableNotifications.bind(self));
        }
    }

    sendMessage(msg) {
        this.state.socket.send(JSON.stringify({
            sender: this.state.userId,
            username: this.state.username,
            body: msg
        }));
    }

    render() {
        let notificationsToggle = this.state.notifications ? this.disableNotifications.bind(this) : this.enableNotifications.bind(this);
        return (
            <div className="panel">
                <Title username={this.state.username} notificationsEnabled={this.state.notifications} notificationsToggle={notificationsToggle} />
                <MessagesContainer messages={this.state.messages} userId={this.state.userId} />
                <SendBox send={this.sendMessage.bind(this)} />
            </div>
        )
    }

    async setUpServiceWorker() {
        if ('serviceWorker' in navigator) {
            let registration = await navigator.serviceWorker.register("/service-worker.js");
            this.setState({
                registration: registration
            });
        }
    }

    async enableNotifications() {
        localStorage.setItem("notifications", "true");
        this.setState({
            notifications: true
        });
        await new Promise(function(resolve, reject) {
            const permissionResult = Notification.requestPermission(function(result) {
                if (result === "granted") {
                    resolve(result);
                } else {
                    reject(result);
                }
            });
        
            if (permissionResult) {
                permissionResult.then(resolve, reject);
            }
        });

        const serverKeyBinaryString = atob("BFKV91ywPyJnCK3ZK9sJdlAwdAV1CSHZnmRM4otYa4mPuN/4ZpcC2dnL8k0+ns+9V4JpQINxm+HUpR0h2oCx5aM");
        const serverKeyBuffer = new Uint8Array(65);
        for (let i = 0; i < 65; i++) {
            serverKeyBuffer[i] = serverKeyBinaryString.charCodeAt(i);
        }

        const subscriptionOptions = {
            userVisibleOnly: true,
            applicationServerKey: serverKeyBuffer
        };

        let pushSubscription = await this.state.registration.pushManager.subscribe(subscriptionOptions);

        console.log("Registered push endpoint", pushSubscription);

        await fetch("/api/pushRegistration?userId=" + this.state.userId, {
            body: JSON.stringify(pushSubscription),
            method: "POST"
        });
    }
    
    async disableNotifications() {
        localStorage.setItem("notifications", "false");
        this.setState({
            notifications: false
        });
        this.state.registration.unregister();
    }
}

class Title extends React.Component {
    render() {
        return (
            <div className="title-section">
                <NotificationToggle enabled={this.props.notificationsEnabled} toggle={this.props.notificationsToggle} />
                <h1 className="title">Reverb</h1>
                <p className="username"><i>{this.props.username}</i></p>
            </div>
        );
    }
}

const disabledIcon = <svg aria-hidden="true" data-prefix="fas" data-icon="bell" className="svg-inline--fa fa-bell fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z"></path></svg>;
const enabledIcon = <svg aria-hidden="true" data-prefix="fas" data-icon="bell-slash" className="svg-inline--fa fa-bell-slash fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M633.82 458.1l-90.62-70.05c.19-1.38.8-2.66.8-4.06.05-7.55-2.61-15.27-8.61-21.71-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84c-40.33 8.38-74.66 31.07-97.59 62.57L45.47 3.37C38.49-2.05 28.43-.8 23.01 6.18L3.37 31.45C-2.05 38.42-.8 48.47 6.18 53.9l588.35 454.73c6.98 5.43 17.03 4.17 22.46-2.81l19.64-25.27c5.42-6.97 4.17-17.02-2.81-22.45zM157.23 251.54c-8.61 67.96-36.41 93.33-52.62 110.75-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h241.92L157.23 251.54zM320 512c35.32 0 63.97-28.65 63.97-64H256.03c0 35.35 28.65 64 63.97 64z"></path></svg>;

class NotificationToggle extends React.Component {
    render() {
        let icon = this.props.enabled ? enabledIcon : disabledIcon;

        return (
            <span className="notification-toggle" onClick={this.props.toggle}>{icon}</span>
        )
    }
}

class MessagesContainer extends React.Component {
    render() {
        let messages = this.props.messages.map(message =>
            <li key={message.id}>
                <Message msg={message} userId={this.props.userId}/>
            </li>
        );

        return (
            <div className="messages-container" id="messages-container">
                <ul className="messages-container-inner">
                    {messages}
                </ul>
                <div id="messages-bottom"></div>
            </div>
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

    onEnterPress = (e) => {
        if (e.keyCode == 13) {
            e.preventDefault();
            this.handleSubmit(e);
        }
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit.bind(this)} className="send-box-container">
                <textarea value={this.state.value} onChange={this.handleChange.bind(this)} className="send-box" autoFocus onKeyDown={this.onEnterPress.bind(this)}></textarea>
                <input type="submit" value="Send" className="send-button"></input>
            </form>
        );
    }

    handleSubmit(event) {
        if (this.state.value.trim()) {
            this.props.send(this.state.value);
        }
        this.setState({
            value: ""
        });
        event.preventDefault();
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }
    
    componentDidUpdate() {
        document.getElementById('messages-bottom').scrollIntoView();
    }

 }

const domContainer = document.getElementById('root');
ReactDOM.render(<App/>, domContainer);
