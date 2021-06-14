/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { SlackDialog } = require('botbuilder-adapter-slack');

module.exports = function (controller) {

  controller.ready(async () => {
    if (process.env.MYTEAM) {
      let bot = await controller.spawn(process.env.MYTEAM);
      await bot.startConversationInChannel(process.env.MYCHAN, process.env.MYUSER);
      bot.say('I AM AWOKEN.');
    }
  });

  // controller.on('direct_message', async(bot, message) => {
  //     await bot.reply(message,'I heard a private message');
  // });

  controller.hears('dm me', 'message', async (bot, message) => {
    await bot.startPrivateConversation(message.user);
    await bot.say(`Let's talk in private.`);
  });

  controller.on('direct_mention', async (bot, message) => {
    await bot.reply(message, `I heard a direct mention that said "${message.text}"`);
  });

  controller.on('mention', async (bot, message) => {
    await bot.reply(message, `You mentioned me when you said "${message.text}"`);
  });

  controller.hears('ephemeral', 'message,direct_message', async (bot, message) => {
    await bot.replyEphemeral(message, 'This is an ephemeral reply sent using bot.re plyEphemeral()!');
  });

  controller.hears('threaded', 'message,direct_message', async (bot, message) => {
    await bot.replyInThread(message, 'This is a reply in a thread!');

    await bot.startConversationInThread(message.channel, message.user, message.incoming_message.channelData.ts);
    await bot.say('And this should also be in that thread!');
  });

  controller.hears('blocks', 'message', async (bot, message) => {

    await bot.reply(message, {
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Hello, Assistant to the Regional Manager Dwight! *Michael Scott* wants to know where you'd like to take the Paper Company investors to dinner tonight.\n\n *Please select a restaurant:*"
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*Farmhouse Thai Cuisine*\n:star::star::star::star: 1528 reviews\n They do have some vegan options, like the roti and curry, plus they have a ton of salad stuff and noodles can be ordered without meat!! They have something for everyone here"
          },
          "accessory": {
            "type": "image",
            "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/c7ed05m9lC2EmA3Aruue7A/o.jpg",
            "alt_text": "alt text for image"
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*Kin Khao*\n:star::star::star::star: 1638 reviews\n The sticky rice also goes wonderfully with the caramelized pork belly, which is absolutely melt-in-your-mouth and so soft."
          },
          "accessory": {
            "type": "image",
            "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/korel-1YjNtFtJlMTaC26A/o.jpg",
            "alt_text": "alt text for image"
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*Ler Ros*\n:star::star::star::star: 2082 reviews\n I would really recommend the  Yum Koh Moo Yang - Spicy lime dressing and roasted quick marinated pork shoulder, basil leaves, chili & rice powder."
          },
          "accessory": {
            "type": "image",
            "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/DawwNigKJ2ckPeDeDM7jAg/o.jpg",
            "alt_text": "alt text for image"
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Farmhouse",
                "emoji": true
              },
              "value": "Farmhouse"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Kin Khao",
                "emoji": true
              },
              "value": "Kin Khao"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Ler Ros",
                "emoji": true
              },
              "value": "Ler Ros"
            }
          ]
        }
      ]
    });

  });

  controller.on('block_actions', async (bot, message) => {
    await bot.reply(message, `Sounds like your choice is ${message.incoming_message.channelData.actions[0].value}`)
  });

  controller.on('slash_command', async (bot, message) => {
    if (message.text === 'plain') {
      await bot.reply(message, 'This is a plain reply');
    } else if (message.text === 'public') {
      await bot.replyPublic(message, 'This is a public reply');
    } else if (message.text === 'private') {
      await bot.replyPrivate(message, 'This is a private reply');
    }

    // set http status
    bot.httpBody({ text: 'You can send an immediate response using bot.httpBody()' });

  });




  controller.on('dialog_submission', async (bot, message) => {
    await bot.reply(message, 'Got a dialog submission');

    // Return an error to Slack
    bot.dialogError([
      {
        "name": "field1",
        "error": "there was an error in field1"
      }
    ])
  });

  controller.on('dialog_cancellation', async (bot, message) => {
    await bot.reply(message, 'Got a dialog cancellation');
  });

  controller.hears(new RegExp(/say announcement "(.+?)"/i), 'direct_mention',
    (bot, message) => {
      console.log(message)
      const text = message.matches[1]
      const reply = {
        text,
        attachments: [
          {
            text: 'Which channel should I send to?',
            fallback: 'Which channel should I send to?',
            callback_id: 'announcement_interactive_channel',
            actions: [
              {
                name: 'channels_list',
                text: 'Which',
                type: 'select',
                data_source: 'channels',
              },
            ],
          },
        ],
      }
      bot.reply(message, reply)
    }
  )
  controller.on(
    'interactive_message',
    async (bot, message) => {
      if (message.callback_id === 'announcement_interactive_channel') {
        console.dir(message, { depth: null })

        const reply = {
          text: message.original_message.text,
          attachments: [
            {
              text: 'Who should I send as?',
              fallback: 'Who should I send as?',
              callback_id: 'announcement_interactive_whom',
              actions: [
                {
                  name: 'send_as_list',
                  text: 'Whom?',
                  type: 'select',
                  options: [
                    {
                      text: 'The Clinic',
                      value: `${message.text},The Clinic`,
                    },
                    {
                      text: '3Shape',
                      value: `${message.text},3Shape`,
                    },
                  ],
                },
              ],
            },
          ],
        }
        bot.replyInteractive(message, reply)
      } else if (message.callback_id === 'announcement_interactive_whom') {
        console.dir(message, { depth: null })
        const channel = message.actions[0].selected_options[0].value
        //const [channel, username] = message.text.split(',')
        const emoji = {
          'The Clinic': ':theclinic_logo:',
          '3Shape': ':3shape:',
        }
        const say = {
          text: message.original_message.text,
          icon_emoji: emoji[username],
          username,
          channel,
        }
        bot.say(say, (err) => {
          if (err) {
            bot.replyInteractive(
              message,
              `Failed sent message to <#${channel}>`
            )
          } else {
            bot.replyInteractive(
              message,
              `Successfully sent message to <#${channel}>`
            )
          }
        })
      }
    }
  )

}