'use strict';

exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

     if (event.session.application.applicationId !== "amzn1.ask.skill.c3fa0ae9-a294-4668-9f95-e0f584a50f90") {
         context.fail("Ungültige Anwendungs ID");
      }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Ausführung beim Start der Session
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);
}

/**
 * Beim Abbruch des Skills ohne Grund etc
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    var cardTitle = "Barkeeper";
    var speechOutput = "Der Barkeeper gibt dir Informationen zu diversen Cocktails";
    callback(session.attributes,
        buildSpeechletResponse(cardTitle, speechOutput, "", true));
}

/**
 * Ausführung bei definiertem Intent siehe Amazon Dev Portal
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    if (intentName == 'CocktailIntent') {
        handleCocktailRequest(intent, session, callback);
    }  else {
        throw "Invalid intent";
    }
}

/**
 * Ausführung falls Nutzer Session beendet.
 * Nicht wenn der skill als Rückgabewert ->  shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

}

// Antwort auf den Testrequest


function handleCocktailRequest(intent, session, callback) {
    var cName = intent.slots.CocktailName.value;
    var options = {
      hostname: 'www.cocktailberater.de',
      port: app.get('port'),
      path: '/website/recipe/index/search_type/tag/search/'+cName+'?format=json',
      method: 'GET',
      json:true
    }
    var responseStr = "Keine Antwort";
    request(options, function(error, response, body)
    {
    if(error) console.log(error);
    else responseStr = body;
    });

    callback(session.attributes,
        buildSpeechletResponseWithoutCard(responseStr, "Möchtest du zu weiteren Cocktails Informationen ?", "false"));
}
function handleStopRequest(intent, session, callback) {
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Bis zum nächsten mal! Und trink nicht zu viel.","", "true"));


}



// ------- Hilfsfunktionen etc -------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min;
}
