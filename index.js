'use strict';

const Alexa = require('alexa-sdk');


const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const languageStrings = {
    'en': {
        translation: {
            SKILL_NAME: 'Magnolium Local Train information',
            WELCOME_MESSAGE: "Welcome to %s. Now, what can I help you with?",
            WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
            HELP_MESSAGE: "You can ask a question like. Ask Darwin What\'s the next train to victoria? Or. Ask Darwin for status on departures. Or. Ask Darwin for status on arrivales. If this is the first time you are using this service say START SETUP. Now what can I help you with?",
            HELP_MESSAGE: "You can ask a question like. Ask Darwin What\'s the next train to victoria? Or. Ask Darwin for status on departures. Or. Ask Darwin for status on arrivales. If this is the first time you are using this service say START SETUP. Now what can I help you with?",
            STOP_MESSAGE: 'Goodbye!',
        }
    },
    'en-GB': {
        translation: {
            SKILL_NAME: 'Magnolium Local Train information',
            WELCOME_MESSAGE: "Welcome to %s. Now, what can I help you with?",
            WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
            HELP_MESSAGE: "You can ask a question like. Ask Darwin What\'s the next train to victoria? Or. Ask Darwin for status on departures. Or. Ask Darwin for status on arrivales. If this is the first time you are using this service say START SETUP. Now what can I help you with?",
            HELP_MESSAGE: "You can ask a question like. Ask Darwin What\'s the next train to victoria? Or. Ask Darwin for status on departures. Or. Ask Darwin for status on arrivales. If this is the first time you are using this service say START SETUP. Now what can I help you with?",
            STOP_MESSAGE: 'Goodbye!',
        }
    }
    
};

//var Rail = require('national-rail-darwin')
//var rail = new Rail('b68b9f85-b0ec-4c81-805c-d28bec03a649');

var http = require('http');
var rp = require('request-promise');

var options = {
    method: 'POST',
    uri: 'http://stiletto.ddns.net/magnoliumapi/train',
    body: {
      'action' : '',
      'token' : 'b68b9f85-b0ec-4c81-805c-d28bec03a649',
      'from' : '',
      'to': '',
      'letter1' : '',
      'letter2' : '',      
      'letter3' : '',
      'deviceid' : ''
    },
    json: true
};

var base_options = {
    method: 'POST',
    uri: 'http://stiletto.ddns.net/magnoliumapi/base',
    body: {
      'action' : '',
      'token' : 'b68b9f85-b0ec-4c81-805c-d28bec03a649',
      'from' : '',
      'to': '',
      'letter1' : '',
      'letter2' : '',      
      'letter3' : '',
      'deviceid' : ''
    },
    json: true
};

const handlers = {
    'LaunchRequest': function () {
        options.body.deviceid = this.event.context.System.device.deviceId;
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },

    'intentSetup': function () {
        
        options.body.action = "SETUP";
        options.body.deviceid = this.event.context.System.device.deviceId;

        const itemSlot1 = this.event.request.intent.slots.ALPHABET_ONE;
        let itemName1 = "";
        if (itemSlot1 && itemSlot1.value) {
            itemName1 = itemSlot1.value.toUpperCase().replace(".","");
        }

        const itemSlot2 = this.event.request.intent.slots.ALPHABET_TWO;
        let itemName2 = "";
        if (itemSlot2 && itemSlot2.value) {
            itemName2 = itemSlot2.value.toUpperCase().replace(".","");
        }

        const itemSlot3 = this.event.request.intent.slots.ALPHABET_THREE;
        let itemName3 = "";
        if (itemSlot3 && itemSlot3.value) {
            itemName3 = itemSlot3.value.toUpperCase().replace(".","");
        }

        var crs = itemName1+itemName2+itemName3;

        options.body.action = "BASE";
        options.body.deviceid = this.event.context.System.device.deviceId;
        options.body.from = crs.toUpperCase();
        options.body.to = crs.toUpperCase();

        if(crs.length === 3)
        {
            httpPost(this, options, (myResult) => {
                let speechOutput = myResult.speech;
                this.emit(':ask', speechOutput);
                this.emit(':responseReady');
            });

        }
        else
        {
            let speechOutput = "The station code should be three alpha characters only.";
            this.emit(':ask', speechOutput);
            this.emit(':responseReady');
        }
    },

    'intentAddBaseCode': function () {
        
        options.body.action = "CRSCODE";
        options.body.deviceid = this.event.context.System.device.deviceId;

        httpPost(this, options, (myResult) => {
            let speechOutput = myResult.speech;
            this.emit(':ask', speechOutput);
            this.emit(':responseReady');
        });

    },

    'intentJourney': function () {
        
        options.body.action = "JOURNEY";
        options.body.deviceid = this.event.context.System.device.deviceId;

        const itemSlot1 = this.event.request.intent.slots.STATION;
        let itemName1 = "";
        if (itemSlot1 && itemSlot1.value) {
            itemName1 = itemSlot1.value.toUpperCase().replace(".","");
        }

        const itemSlot2 = this.event.request.intent.slots.STATION;
        let itemName2 = "";
        if (itemSlot2 && itemSlot2.value) {
            itemName2 = itemSlot2.value.toUpperCase().replace(".","");
        }

        options.body.action = "JOURNEY";
        options.body.deviceid = this.event.context.System.device.deviceId;
        options.body.from = itemName1.toLowerCase();
        options.body.to = itemName2.toLowerCase();

        httpPost(this, options, (myResult) => {
            let speechOutput = myResult.speech;
            this.emit(':ask', speechOutput);
            this.emit(':responseReady');
        });

    },

    'intentDestination': function () {
        const itemSlot = this.event.request.intent.slots.STATION;
        let itemName = "?";
        if (itemSlot && itemSlot.value) {
            itemName = itemSlot.value.toLowerCase();
        }

        base_options.body.deviceid = this.event.context.System.device.deviceId;

        httpPost(this, base_options, (baseResult) => {
            options.body.action = "GOING";
            options.body.deviceid = this.event.context.System.device.deviceId;
            options.body.from = baseResult.name.toLowerCase();
            options.body.to = itemName;

            httpPost(this, options, (myResult) => {
                let speechOutput = myResult.speech;
                this.emit(':ask', speechOutput);
                this.emit(':responseReady');
            });
            
        });

    },

    'intentDestinationTrains': function () {
        const itemSlot = this.event.request.intent.slots.STATION;
        let itemName = "?";
        if (itemSlot && itemSlot.value) {
            itemName = itemSlot.value.toLowerCase();
        }

        base_options.body.deviceid = this.event.context.System.device.deviceId;

        httpPost(this, base_options, (baseResult) => {
            options.body.action = "ALLGOING";
            options.body.deviceid = this.event.context.System.device.deviceId;
            options.body.from = baseResult.name.toLowerCase();
            options.body.to = itemName;

            httpPost(this, options, (myResult) => {
                let speechOutput = myResult.speech;
                this.attributes.lastSpeech = speechOutput;
                this.emit(':ask', speechOutput + " Would you like me to repeat this?");
                this.emit(':responseReady');
            });
            
        });

    },

    'AMAZON.RepeatIntent': function () { 
        this.emit(':ask', this.attributes.lastSpeech + " Would you like me to repeat this?").listen("Would you like me to repeat this?"); 
        this.emit(':responseReady'); 
    },

    'AMAZON.YesIntent': function () { 
        this.emit(':ask', this.attributes.lastSpeech + " Would you like me to repeat this?").listen("Would you like me to repeat this?"); 
    }, 
    
    'AMAZON.NoIntent': function () { 
        this.response.speak("Thank you"); 
        this.emit(':responseReady'); 
    }, 

    'intentTrainInfo': function () {
        const itemSlot = this.event.request.intent.slots.DIRECTION;
        let itemName = "?";
        if (itemSlot && itemSlot.value) {
            itemName = itemSlot.value.toLowerCase();
        }

        base_options.body.deviceid = this.event.context.System.device.deviceId;

        httpPost(this, base_options, (baseResult) => {
            options.body.action = "INFO";
            options.body.deviceid = this.event.context.System.device.deviceId;
            options.body.from = baseResult.name.toLowerCase();
            options.body.to = itemName;

            httpPost(this, options, (myResult) => {
                let speechOutput = myResult.speech;
                this.emit(':ask', speechOutput);
                this.emit(':responseReady');
            });
        });

    },

    'intentJourney': function () {
        let slot1Value = GetValue( this.event.request.intent.slots, 0);        
        let slot2Value = GetValue( this.event.request.intent.slots, 1);        

        options.body.deviceid = this.event.context.System.device.deviceId;
        options.body.action = "JOURNEY";
        options.body.from = slot1Value;
        options.body.to = slot2Value;
        
        httpPost(this, options, (myResult) => {
            //let json = JSON.stringify(myResult);
            console.log(myResult);
            let speechOutput = myResult.speech;
            this.emit(':ask', speechOutput);
            this.emit(':responseReady');
        });
    },

    ////////////////////////////////////////////////////////////////////////////////
    'intentTimetable': function () {
        const itemSlot = this.event.request.intent.slots.STATION;
        let itemName = "?";
        if (itemSlot && itemSlot.value) {
            itemName = itemSlot.value.toLowerCase();
        }

        options.body.action = "TIMETABLE";
        options.body.deviceid = this.event.context.System.device.deviceId;
        options.body.from = itemName;
        options.body.to = itemName;

        httpPost(this, options, (myResult) => {
            let speechOutput = myResult.speech;
            this.emit(':ask', speechOutput);
            this.emit(':responseReady');
        });
    },

    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    /*
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    */
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },

    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },

    'SessionEndedRequest': function () {    
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

function GetValue(slots, index)
{
    let count = 0;        

    let slotValue = null;        

    for (let slot in slots) 
    {
        if(count === index)
            return slots[slot].value;
        count += 1;
    }


    return 0;
}

function httpPost(that, options, callback) {

    rp(options)
        .then(function (parsedBody) {
            callback(parsedBody);  
        })
        .catch(function (err) {
            let resp = 'This call has failed';
            that.response.speak(resp);
            that.emit(':responseReady');
        }).finally(function () {
        }); 
    
}
