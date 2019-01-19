const Alexa = require('ask-sdk');

exports.handler =
    Alexa.SkillBuilders.standard()
        .addRequestHandlers(
            ReverbHandler
        )
        .addErrorHandlers(
            ErrorHandler
        )
        .lambda();