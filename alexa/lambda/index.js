const Alexa = require('ask-sdk');
const Handler = require('./handler');
const Error = require('./error');

exports.handler =
    Alexa.SkillBuilders.standard()
        .addRequestHandlers(
            Handler.ReverbHandler
        )
        .addErrorHandlers(
            Error.ErrorHandler
        )
        .lambda();