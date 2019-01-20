require('dotenv').config();
const Request = require('request-promise-native');

function postProactive(token, name) {
    var timestamp = new Date();
    var expiry = new Date(timestamp);
    expiry.setMinutes(expiry.getMinutes() + 60);
    return Request.post(
        'https://api.eu.amazonalexa.com/v1/proactiveEvents/stages/development',
        {
            headers: {
                'Authorization' : 'Bearer ' + token
            },
            json: {
                timestamp: timestamp,
                referenceId: "NewMessageReferenceId",
                expiryTime: expiry,
                relevantAudience: {
                    type: 'Multicast',
                    payload: {}
                },
                event: {
                    name: 'AMAZON.MessageAlert.Activated',
                    payload: {
                        state: {
                            status: 'UNREAD',
                            freshness: 'NEW'
                        },
                        messageGroup: {
                            creator: {
                                name: name
                            },
                            count: 1
                        }
                    }
                }
            }
        }
    );
}

function getToken() {
    return Request.post('https://api.amazon.com/auth/O2/token')
        .form({
            grant_type: 'client_credentials',
            scope: 'alexa::proactive_events',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        })
}

function notify(name) {
    getToken().then(function (res) {
        postProactive(JSON.parse(res).access_token, name);
    });
}

notify(process.argv[2]);