const Alexa = require('ask-sdk-core');

// POST /api/newMessage { senderName: "Jamie", senderIdentifier: uint64"xy27", message: "Hello there" }

FALLBACK_MESSAGE = 'Sorry, but I can\'t understand your request.'
FALLBACK_REPROMPT = 'How can I help?'

const SendMessageIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type == 'LaunchRequest'
            || (request.type == 'IntentRequest'
                && request.intent.name == 'SendMessageIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('To infinity and beyond')
            .getResponse();
    }
};

const ConfirmIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type == 'LaunchRequest'
            || (request.type == 'IntentRequest'
                && request.intent.name == 'Confirm.Intent.603332935488');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Broadcasting your message')
            .getResponse();
    }
}

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type == 'IntentRequest'
            && request.intent.name == 'AMAZON.FallbackIntent';
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
            ConfirmIntentHandler,
            FallbackIntentHandler
        )
        .addErrorHandlers(
            ErrorHandler
        )
        .lambda();