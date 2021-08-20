//  __   __  ___        ___
// |__) /  \  |  |__/ |  |  
// |__) \__/  |  |  \ |  |  

// This is the main file for the bender bot.

// Import Botkit's core features
const { Botkit } = require('botkit');
const { BotkitCMSHelper } = require('botkit-plugin-cms');

// Import a platform-specific adapter for slack.

const { SlackAdapter, SlackMessageTypeMiddleware, SlackEventMiddleware } = require('botbuilder-adapter-slack');

const { MongoDbStorage } = require('botbuilder-storage-mongodb');

// Load process.env values from .env file
require('dotenv').config();

let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage = new MongoDbStorage({
        url: process.env.MONGO_URI,
    });
}

const BotkitRocketChat = require('botkit-rocketchat-connector')
const debug = require('debug')('botkit:main')

// the environment variables from RocketChat is passed in bot_options
// because the module it's external, so haven't access to .env file
const rocketOptions = {
    debug: true,
    studio_token: process.env.studio_token,
    studio_command_uri: process.env.studio_command_uri,
    studio_stats_uri: process.env.studio_command_uri,
    rocketchat_host: process.env.ROCKETCHAT_URL,
    rocketchat_bot_user: process.env.ROCKETCHAT_USER,
    rocketchat_bot_pass: process.env.ROCKETCHAT_PASSWORD,
    rocketchat_ssl: process.env.ROCKETCHAT_USE_SSL,
    rocketchat_bot_rooms: process.env.ROCKETCHAT_ROOM,
    rocketchat_bot_mention_rooms: process.env.MENTION_ROOMS,
    rocketchat_bot_direct_messages: process.env.RESPOND_TO_DM,
    rocketchat_bot_live_chat: process.env.RESPOND_TO_LIVECHAT,
    rocketchat_bot_edited: process.env.RESPOND_TO_EDITED
  }
  

const slackAdapter = new SlackAdapter({
    // parameters used to secure webhook endpoint
    verificationToken: process.env.VERIFICATION_TOKEN,
    clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,

    // credentials used to set up oauth for multi-team apps
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    scopes: ['bot', 'users:read', 'users:read.email'],
    redirectUri: process.env.REDIRECT_URI,

    // functions required for retrieving team-specific info
    // for use in multi-team apps
    getTokenForTeam: getTokenForTeam,
    getBotUserByTeam: getBotUserByTeam,
});

// Use SlackEventMiddleware to emit events that match their original Slack event types.
slackAdapter.use(new SlackEventMiddleware());

// Use SlackMessageType middleware to further classify messages as direct_message, direct_mention, or mention
slackAdapter.use(new SlackMessageTypeMiddleware());


const controllerSlack = new Botkit({
    webhook_uri: '/api/messages',
    adapter: slackAdapter,
    storage
});

// create the Botkit controller with the configurations of the RocketChatBot
const controllerRocketChat = BotkitRocketChat({storage}, rocketOptions)

// imports local conversations to use bot without the botkit api
//require(__dirname + '/components/local_conversations.js')(controllerRocketChat)

controllerRocketChat.startBot()

controllerRocketChat.startTicking()

var normalizedPath = require('path').join(__dirname, 'skills')
require('fs').readdirSync(normalizedPath).forEach(function (file) {
  require('./skills/' + file)(controllerRocketChat)
})

if (process.env.CMS_URI) {
    controllerSlack.usePlugin(new BotkitCMSHelper({
        uri: process.env.CMS_URI,
        token: process.env.CMS_TOKEN,
    }));
}

if (process.env.studio_token) {
  // TODO: configure the EVENTS here
  controllerRocketChat.on(['direct_message', 'live_chat', 'channel', 'mention', 'message'], function (bot, message) {
  controllerRocketChat.studio.runTrigger(bot, message.text, message.user, message.channel, message).then(function (convo) {
    if (!convo) {
      // no trigger was matched
      // If you want your botbot to respond to every message,
      // define a 'fallback' script in Botkit Studio
      // and uncomment the line below.
      // controllerRocketChat.studio.run(bot, 'fallback', message.user, message.channel);
    } else {
      // set variables here that are needed for EVERY script
      // use controllerRocketChat.studio.before('script') to set variables specific to a script
      convo.setVar('current_time', new Date())
    }
    }).catch(function (err) {
      bot.reply(message, 'I experienced an error with a request to Botkit Studio: ' + err)
      debug('Botkit Studio: ', err)
    })
  })
} else {
  console.log('~~~~~~~~~~')
  console.log('NOTE: Botkit Studio functionality has not been enabled')
  console.log('To enable, pass in a studio_token parameter with a token from https://studio.botkit.ai/')
}

// Once the bot has booted up its internal services, you can use them to do stuff.
controllerSlack.ready(() => {

    // load traditional developer-created local custom feature modules
    controllerSlack.loadModules(__dirname + '/features');

    /* catch-all that uses the CMS to trigger dialogs */
    if (controllerSlack.plugins.cms) {
        controllerSlack.on('message,direct_message', async (bot, message) => {
            let results = false;
            results = await controllerSlack.plugins.cms.testTrigger(bot, message);

            if (results !== false) {
                // do not continue middleware!
                return false;
            }
        });
    }

});



controllerSlack.webserver.get('/', (req, res) => {

    res.send(`This app is running Botkit ${controllerSlack.version}.`);

});






controllerSlack.webserver.get('/install', (req, res) => {
    // getInstallLink points to slack's oauth endpoint and includes clientId and scopes
    res.redirect(controllerSlack.adapter.getInstallLink());
});

controllerSlack.webserver.get('/install/auth', async (req, res) => {
    try {
        const results = await controllerSlack.adapter.validateOauthCode(req.query.code);

        console.log('FULL OAUTH DETAILS', results);

        storage.write({
            [results.team_id]: {
                bot_access_token: results.bot.bot_access_token,
                bot_user_id: results.bot.bot_user_id,
            },
        })

        // Store token by team in bot state.
        tokenCache[results.team_id] = results.bot.bot_access_token;

        // Capture team to bot id
        userCache[results.team_id] = results.bot.bot_user_id;

        res.json('Success! Bot installed.');

    } catch (err) {
        console.error('OAUTH ERROR:', err);
        res.status(401);
        res.send(err.message);
    }
});

let tokenCache = {};
let userCache = {};

if (process.env.TOKENS) {
    tokenCache = JSON.parse(process.env.TOKENS);
}

if (process.env.USERS) {
    userCache = JSON.parse(process.env.USERS);
}

async function getTokenForTeam(teamId) {
    const team = (await storage.read([teamId]))[teamId];
    if (team && team.bot_access_token) {
        return team.bot_access_token
    } else {
        console.error('Team not found in tokenCache: ', teamId);
    }
}

async function getBotUserByTeam(teamId) {
    const team = (await storage.read([teamId]))[teamId];
    if (team && team.bot_user_id) {
        return team.bot_user_id
    } else {
        console.error('Team not found in userCache: ', teamId);
    }
}

