const Alexa = require('ask-sdk-core');
const Request = require('request');

const FALLBACK_MESSAGE = 'Sorry, but I can\'t understand your request.';
const REPROMPT = 'How can I help?';
const WELCOME = 'Hello, welcome to Reverb. How can I help?';
const GOODBYE = 'Goodbye.';
const SENT = 'Sent.';

const API_ENDPOINT = 'http://www.xn--p18h.tk:8080/api/newMessage';

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

function randFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateName() {
    return `${randFrom(ADJECTIVES)}-${randFrom(ADJECTIVES)}-${randFrom(NOUNS)}`;
}

function getRequest(handlerInput) {
    return handlerInput.requestEnvelope.request;
}


function setName(handlerInput, name) {
    attr = handlerInput.attributesManager.getSessionAttributes();
    attr['username'] = generateName();
    handlerInput.attributesManager.setSessionAttributes(attr);
    return attr['username'];
}

function getName(handlerInput) {
    attr = handlerInput.attributesManager.getSessionAttributes();
    if (attr['username']) {
        return attr['username'];
    }
    else {
        return setName(generateName());
    }
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
        Request.post({
            uri: API_ENDPOINT,
            json: {
                username: getName(handlerInput),
                body: request.intent.slots.message.value
            }
        });
        return handlerInput.responseBuilder
            .speak(SENT)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const StopIntentHandler = {
    canHandle(handlerInput) {
        return isIntentRequest(handlerInput, 'StopIntent')
            || isIntentRequest(handlerInput, 'NavigateHomeIntent')
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
        var message = 'Sorry, an error has occurred.';
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
            FallbackIntentHandler
        )
        .addErrorHandlers(
            ErrorHandler
        )
        .lambda();