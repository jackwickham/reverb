const Alexa = require('ask-sdk-core');

// POST /api/newMessage { senderName: "Jamie", senderIdentifier: uint64"xy27", message: "Hello there" }

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

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(input, error) {
        console.log(`Error handled: ${error.message}`);
        return input.responseBuilder
            .speak('Sorry, an error occurred')
            .reprompt('Sorry, an error occurred')
            .getResponse();
    }
};

exports.handler =
    Alexa.SkillBuilders.custom()
        .addRequestHandlers(
            SendMessageIntentHandler
        )
        .addErrorHandlers(
            ErrorHandler
        )
        .lambda();