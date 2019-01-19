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
}