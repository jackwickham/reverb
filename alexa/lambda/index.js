const Alexa = require('ask-sdk-core');

const ReverbHandler = {
    canHandle() {
        return true;
    },
    handle(input) {
        return input.responseBuilder
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
            ReverbHandler
        )
        .addErrorHandlers(
            ErrorHandler
        )
        .lambda();