const Alexa = require('ask-sdk-core');
const Http = require('http');

// POST /api/newMessage { username: "Jamie", body: "Hello there" }

FALLBACK_MESSAGE = 'Sorry, but I can\'t understand your request.'
REPROMPT = 'How can I help?'
WELCOME = 'Hello, welcome to Reverb. How can I help?'
GOODBYE = 'Goodbye.'

function isIntentRequest(handlerInput, name) {
    const request = handlerInput.requestEnvelope.request;
    return request.type == 'IntentRequest' && request.intent.name == name;
}

function isLaunchRequest(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type == 'LaunchRequest';
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
        return handlerInput.responseBuilder
            .speak('43')
            .withShouldEndSession(false)
            .getResponse();
    }
};

const ExitIntentHandler = {
    canHandle(handlerInput) {
        return isIntentRequest(handlerInput, 'ExitIntent')
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
        console.log(`Error handled: ${error.message}`);
        var message = 'Sorry, an error has occurred.';
        if (process.env.DEBUG) {
            const request = handlerInput.requestEnvelope.request;
            message = `Error for type=${request.type}`
                + `intent=${request.intent.name}: ${error.message}`;
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
            ExitIntentHandler,
            FallbackIntentHandler
        )
        .addErrorHandlers(
            ErrorHandler
        )
        .lambda();