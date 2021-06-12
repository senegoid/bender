require('dotenv').config();
const _ = require("lodash");
const { ListClients } = require("../airtable/clients");
const { ListCoaches } = require("../airtable/coaches");
const { ListPrograms } = require('../airtable/programs');

module.exports = function (controller) {
  const key = process.env.AIRTABLE_API_KEY;

  controller.hears('report clients', 'message,direct_message', async (bot, message) => {
    let user;
    try {
      user = (await controller.storage.read([message.user]))[message.user]
      if (user.airtableBase) {
        ShowReportClients(bot, message, key, user.airtableBase);
      }
    } catch (error) {
    }
  });

  controller.hears(new RegExp(/client (.*?)$/i), 'message,direct_message', async (bot, message) => {
    const name = message.matches[1];
    let user;
    try {
      user = (await controller.storage.read([message.user]))[message.user]
      if (user.airtableBase) {
        ShowDetailsClient(bot, message, key, user.airtableBase, name);
      }
    } catch (error) {
    }

  });


  const ShowReportClients = async (bot, message, key, base) => {
    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });
    await bot.changeContext(message.reference)
    const clients = await ListClients(key, base);
    let blocks = []

    const countEmail = _.countBy(clients, 'Email');
    const undefinedEmails = countEmail.undefined;
    delete countEmail.undefined;
    const uniqueEmails = _.keysIn(countEmail).length;
    const repeatedEmails = _.omitBy(countEmail, (o) => o == 1);

    const countNames = _.countBy(clients, 'Full Name');
    const undefinedNames = countNames.undefined || 0;
    delete countNames.undefined;
    const uniqueNames = _.keysIn(countNames).length;
    const repeatedNames = _.omitBy(countNames, (o) => o == 1);

    const countCoaches = _.countBy(clients, 'Coach');
    const uniqueCoaches = _.keysIn(countCoaches).length;

    let repeatedEmailsText = "";
    _.forIn(repeatedEmails, function (value, key) {
      repeatedEmailsText += `\n ${value}x ${key} `
    });

    let repeatedNamesText = "";
    _.forIn(repeatedNames, function (value, key) {
      repeatedNamesText += `\n ${value}x ${key} `
    });

    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*Active Clients ${clients.length}* \n Emails:${uniqueEmails} \nNames: ${uniqueNames} \n Attended by ${uniqueCoaches} coaches.`
      }
    });
    blocks.push(
      {
        "type": "divider"
      });
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*Emails* \n Empty: ${undefinedEmails} ${repeatedEmailsText}`
      }
    });
    blocks.push(
      {
        "type": "divider"
      });
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*Names* \n Empty: ${undefinedNames} ${repeatedNamesText}`
      }
    });
    blocks.push(
      {
        "type": "divider"
      });

    await bot.reply(message, { blocks });
  }

  const ShowDetailsClient = async (bot, message, key, base, name) => {
    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });
    await bot.changeContext(message.reference)
    const clients = await ListClients(key, base, name);
    const coaches = await ListCoaches(key, base);
    const programs = await ListPrograms(key, base);
    let blocks = []
    let row = 0;
    for await (let client of clients) {
      row++;
      const clientCoach = coaches.filter((coach) => client.Coach && client.Coach[0] === coach.id);
      const clientPrograms = programs.filter((program) => client.Programs && client.Programs[0] === program.id);
      blocks.push({
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `*${client["Full Name"]}*      ${client.Email}    \n     Coach: ${clientCoach[0] && clientCoach[0]["Full Name"]}\n     Program: ${clientPrograms[0] && clientPrograms[0]["Program Name"]}\n     Status: ${client["Overall Status"]} `
        }
      });
      blocks.push(
        {
          "type": "divider"
        });
      if (row == 20) {
        await bot.reply(message, { blocks });
        blocks = [];
        row = 0;
      }
    }
    if (row != 0) { await bot.reply(message, { blocks }); }
  }
}