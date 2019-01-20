const Request = require('request-promise-native');

function postProactive(token) {
    return Request.post('api.eu.amazonalexa.com/v1/proactiveEvents/stages/development', {
        headers: {
            'Authorization' : 'Bearer ' + token
        },
        json: {
            state: {
                status: 'UNREAD',
                freshness: 'NEW'
            },
            messageGroup: {
                creator: {
                    name: 'JumboJimbo'
                },
                count: 10
            }
        }
    });
}

function getToken() {
    return Request.post('api.amazon.com/auth/O2/token')
        .form({
            grant_type: 'client_credentials',
            scope: 'alexa::proactive_events',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        })
}

function notify() {
    getToken().then(function (token) {
        postProactive(token);
    });
}

notify();