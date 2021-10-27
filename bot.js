//  __   __  ___        ___
// |__) /  \  |  |__/ |  |  
// |__) \__/  |  |  \ |  |  

const http = require("http");
const express = require("express");

const errors = require('./notion/error');

const { Botkit } = require('botkit');
const { BotkitCMSHelper } = require('botkit-plugin-cms');

const { WebAdapter } = require('botbuilder-adapter-web');
const { SlackAdapter, SlackMessageTypeMiddleware, SlackEventMiddleware } = require('botbuilder-adapter-slack');

const { MongoDbStorage } = require('botbuilder-storage-mongodb');

require('dotenv').config();

const webserver = express();
webserver.use((req, res, next) => {
    req.rawBody = '';
    req.on('data', function (chunk) {
        req.rawBody += chunk;
    });
    next();
});
webserver.use(express.json());
webserver.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
const httpserver = http.createServer(webserver);

let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage = new MongoDbStorage({
        url: process.env.MONGO_URI,
    });
}

const BotkitRocketChat = require('botkit-rocketchat-connector')
const debug = require('debug')('botkit:main')

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
    verificationToken: process.env.VERIFICATION_TOKEN,
    clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    scopes: ['bot', 'users:read', 'users:read.email'],
    redirectUri: process.env.REDIRECT_URI,

    getTokenForTeam: getTokenForTeam,
    getBotUserByTeam: getBotUserByTeam,
});

slackAdapter.use(new SlackEventMiddleware());
slackAdapter.use(new SlackMessageTypeMiddleware());


const controllerSlack = new Botkit({
    webserver,
    webhook_uri: '/api/messages',
    adapter: slackAdapter,
    storage, 
});


const webAdapter = new WebAdapter({server: httpserver});

const controllerWeb = new Botkit({
    webserver,
    webhook_uri: '/api/msg',
    adapter: webAdapter,
    storage
});


const controllerRocketChat = BotkitRocketChat({}, rocketOptions)
controllerRocketChat.storage = storage;
controllerRocketChat.startBot()
controllerRocketChat.startTicking()

const normalizedPathCommon = require('path').join(__dirname, 'features/common',)
require('fs').readdirSync(normalizedPathCommon).forEach(function (file) {
    require('./features/common/' + file)(controllerRocketChat)
})
const normalizedPath = require('path').join(__dirname, 'features/rocketChat',)
require('fs').readdirSync(normalizedPath).forEach(function (file) {
  require('./features/rocketChat/' + file)(controllerRocketChat)
})


if (process.env.CMS_URI) {
    controllerSlack.usePlugin(new BotkitCMSHelper({
        uri: process.env.CMS_URI,
        token: process.env.CMS_TOKEN,
    }));
}

if (process.env.studio_token) {
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
}

controllerSlack.loadModules(__dirname + '/features/common');
controllerWeb.loadModules(__dirname + '/features/common');

controllerSlack.loadModules(__dirname + '/features/slack');
controllerWeb.loadModules(__dirname + '/features/web');

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




controllerSlack.webserver.get('/install', (req, res) => {
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

        tokenCache[results.team_id] = results.bot.bot_access_token;
        userCache[results.team_id] = results.bot.bot_user_id;

        res.json('Success! Bot installed.');

    } catch (err) {
        console.error('OAUTH ERROR:', err);
        res.status(401);
        res.send(err.message);
    }
});

webserver.post('/errors', async (req, res) => {
    try{
      //const { instituicao } = req.params;
      const { body } = req;
      errors.add(body);
      return res.json('ok');
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
});

let tokenCache = {};
let userCache = {};


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

if (require.main === module) {
   
    httpserver.listen(port, function () {
        console.log("Slack Webhook endpoint online:  http://127.0.0.1:" + port + '/api/messages' );
        console.log("web Webhook endpoint online:  http://127.0.0.1:" + port + '/api/msg');
        console.log('Chat with me: http://localhost:' + port);
    });
};
