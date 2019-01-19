exports = {
    ReverbHandler: {
        canHandle() {
            return true;
        },
        handle(input) {
            return input.responseBuilder
                .speak('Of course I still love you')
                .getResponse();
        }
    }
}