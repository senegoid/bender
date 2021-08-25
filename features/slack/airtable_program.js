require('dotenv').config();
const _ = require("lodash");
const { ListPrograms } = require('../../airtable/programs');

module.exports = function (controller) {
  const key = process.env.AIRTABLE_API_KEY;

  controller.hears('show programs', 'message,direct_message', async (bot, message) => {

    ShowPrograms(bot, message, key);
    return true;
  });

  controller.hears('report type of programs', 'message,direct_message', async (bot, message) => {

    ReportPrograms(bot, message, key);
    return true;
  });


  const ShowPrograms = async (bot, message, key) => {
    await bot.changeContext(message.reference)
    let user;
    try {
      user = await controller.storage.read([`${message.team}_users`])
      user = user[`${message.team}_users`][message.user]
      if (!user.airtableBase) {
        bot.reply(message, "You didn't choose an Airtable base \n Say: set airtable base xxxxxxxxxxx to choose one.")
        return
      }
    } catch (error) {
      bot.reply(message, "Who are you? I don't think I have your username. Say hi to me.");
    }
    const base = user.airtableBase

    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });

    const programs = await ListPrograms(key, base);
    let blocks = []
    let row = 0;
    for await (let program of programs) {
      row++;
      blocks.push({
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `*${program["Program Name"]}*\n   ${program["Program Type"]}     Clients: ${program["Number of Clients on the Program"]}`
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

  const ReportPrograms = async (bot, message, key) => {
    await bot.changeContext(message.reference)
    let user;
    try {
      user = await controller.storage.read([`${message.team}_users`])
      user = user[`${message.team}_users`][message.user]
      if (!user.airtableBase) {
        bot.reply(message, "You didn't choose an Airtable base \n Say: set airtable base xxxxxxxxxxx to choose one.")
        return
      }
    } catch (error) {
      bot.reply(message, "Who are you? I don't think I have your username. Say hi to me.");
    }
    const base = user.airtableBase

    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });

    const programs = await ListPrograms(key, base);
    const byTypes = _.groupBy(programs, "Program Type");
    let blocks = []
    let row = 0;
    for (const programType in byTypes) {
      const _programs = _.keysIn(_.countBy(byTypes[programType], 'Program Name')).length;
      const _sumTotalPrice = _.sumBy(byTypes[programType], (n) => n["Total Price"])
      const _sumAmount = _.sumBy(byTypes[programType], (p) => p.amount || 0)
      const _sumRetentionAmount = _.sumBy(byTypes[programType], (n) => n["retention-amount"])
      const _sumCostPerPayment = _.sumBy(byTypes[programType], (n) => n["Cost Per Payment"])

      row++;
      blocks.push({
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `*${programType}*\n   Programs: ${_programs}     Total Price:  ${_sumTotalPrice}  \n   Amount: ${_sumAmount}      Retenntion: ${_sumRetentionAmount}      Cost Per Payment: ${_sumCostPerPayment}`
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