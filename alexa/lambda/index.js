const Alexa = require('ask-sdk-core');

// POST /api/newMessage { senderName: "Jamie", senderIdentifier: uint64"xy27", message: "Hello there" }

FALLBACK_MESSAGE = 'Sorry, but I can\'t understand your request.'
FALLBACK_REPROMPT = 'How can I help?'
GOODBYE = 'Goodbye.'

function isIntentRequest(handlerInput, name) {
    const request = handlerInput.requestEnvelope.request;
    return request.type == 'IntentRequest' && request.intent.name == name;
}

function isLaunchRequest(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type == 'LaunchRequest';
}

const SendMessageIntentHandler = {
    canHandle(handlerInput) {
        return isLaunchRequest(handlerInput)
            || isIntentRequest(handlerInput, 'SendMessageIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('To infinity and beyond')
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
            .reprompt(FALLBACK_REPROMPT)
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
            SendMessageIntentHandler,
            ExitIntentHandler,
            FallbackIntentHandler
        )
        .addErrorHandlers(
            ErrorHandler
        )
        .lambda();