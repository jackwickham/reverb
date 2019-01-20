const Alexa = require('ask-sdk-core');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
const Request = require('request-promise-native');

const FALLBACK_MESSAGE = 'Sorry, but I can\'t understand your request.';
const REPROMPT = 'How can I help?';
const WELCOME = 'Hello, welcome to Reverb. How can I help?';
const GOODBYE = 'Goodbye.';
const SENT = 'Sent.';
const USERNAME_SET = 'Your username has been changed.'
const SORRY_ERROR = 'Sorry, an error has occurred.';

const API_ENDPOINT = 'https://www.xn--p18h.tk/api/newMessage';

const ADJECTIVES = [
    'fun', 'sad', 'happy', 'basic', 'large', 'important', 'different',
    'available', 'popular', 'able', 'hot', 'scared', 'old', 'healthy',
    'traditional', 'strong', 'successful', 'nyan'
];
const NOUNS = [
    'horse', 'cat', 'dog', 'giraffe', 'book', 'business', 'child', 'country',
    'eyeball', 'fact', 'hand', 'seaman', 'student', 'person', 'thing', 'family',
    'group', 'prime-minster', 'pig',
];

function makeSafeName(name) {
    return name
        .toLowerCase()
        .replace(/\s/, '-')
        .replace(/[^a-z\s-]/, '');
}

function randFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateName() {
    return `${randFrom(ADJECTIVES)}-${randFrom(ADJECTIVES)}-${randFrom(NOUNS)}`;
}

function getRequest(handlerInput) {
    return handlerInput.requestEnvelope.request;
}

function getAttr(handlerInput) {
    return handlerInput.attributesManager.getPersistentAttributes();
}

function setAttr(handlerInput, attr) {
    handlerInput.attributesManager.setPersistentAttributes(attr);
    handlerInput.attributesManager.savePersistentAttributes();
}

function setName(handlerInput, name) {
    return getAttr(handlerInput).then(attr => {
        attr['username'] = makeSafeName(name);
        console.log(attr['username']);
        setAttr(handlerInput, attr);
        return attr['username'];
    });
}

function getName(handlerInput) {
    return getAttr(handlerInput).then(attr => {
        if (attr['username']) {
            return attr['username'];
        }
        else {
            return setName(handlerInput, generateName());
        }
    });
}

function isIntentRequest(handlerInput, name) {
    const request = getRequest(handlerInput);
    return request.type == 'IntentRequest' && request.intent.name == name;
}

function isLaunchRequest(handlerInput) {
    const request = getRequest(handlerInput);
    return request.type == 'LaunchRequest';
}

function isEndRequest(handlerInput) {
    const request = getRequest(handlerInput);
    return request.type == 'SessionEndedRequest';
}

const LaunchIntentHandler = {
    canHandle(handlerInput) {
        return isLaunchRequest(handlerInput);
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(WELCOME)
            .reprompt(REPROMPT)
            .withShouldEndSession(false)
            .getResponse();
    }
}

const SendMessageIntentHandler = {
    canHandle(handlerInput) {
        return isIntentRequest(handlerInput, 'SendMessageIntent');
    },
    handle(handlerInput) {
        const request = getRequest(handlerInput);
        return getName(handlerInput).then(username => 
            Request.post({
                uri: API_ENDPOINT,
                json: {
                    username: username,
                    body: request.intent.slots.message.value
                }
            }).then(function () {
                return handlerInput.responseBuilder
                    .speak(SENT)
                    .withShouldEndSession(false)
                    .getResponse();
            }));
    }
};

const SetUsernameIntentHandler = {
    canHandle(handlerInput) {
        return isIntentRequest(handlerInput, 'SetUsernameIntent');
    },
    handle(handlerInput) {
        const request = getRequest(handlerInput);
        return setName(handlerInput, request.intent.slots.username.value).then(name => 
            handlerInput.responseBuilder
                .speak(USERNAME_SET)
                .withShouldEndSession(false)
                .getResponse());
    }
};

const StopIntentHandler = {
    canHandle(handlerInput) {
        return isIntentRequest(handlerInput, 'AMAZON.StopIntent')
            || isIntentRequest(handlerInput, 'AMAZON.NavigateHomeIntent')
            || isEndRequest(handlerInput);
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(GOODBYE)
            .withShouldEndSession(true)
            .getResponse();
    }
}

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return isIntentRequest(handlerInput, 'AMAZON.FallbackIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(FALLBACK_MESSAGE)
            .reprompt(REPROMPT)
            .getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;
        console.log(`Error handled: ${error.message} ${JSON.stringify(request)}`);
        var message = SORRY_ERROR;
        if (process.env.DEBUG) {
            message = `Error for request=${JSON.stringify(request)}: ${error.message}`;
        }
        return handlerInput.responseBuilder
            .speak(message)
            .reprompt(message)
            .getResponse();
    }
};

exports.handler =
    Alexa.SkillBuilders.custom()
        .addRequestHandlers(
            LaunchIntentHandler,
            SendMessageIntentHandler,
            StopIntentHandler,
            SetUsernameIntentHandler,
            FallbackIntentHandler
        )
        .addErrorHandlers(
            ErrorHandler
        )
        .withPersistenceAdapter(
            new DynamoDbPersistenceAdapter({
                tableName: 'reverb-alexa-persistence',
                createTable: true
            })
        )
        .lambda();