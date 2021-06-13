require('dotenv').config();
const _ = require("lodash");
const { ListPrograms } = require('../airtable/programs');

module.exports = function (controller) {
  const key = process.env.AIRTABLE_API_KEY;

  controller.hears('show programs', 'message,direct_message', async (bot, message) => {
    let user;
    try {
      user = (await controller.storage.read([message.user]))[message.user]
      if (user.airtableBase) {
        ShowPrograms(bot, message, key, user.airtableBase);
      }
    } catch (error) {
    }
  });

  controller.hears('report type of programs', 'message,direct_message', async (bot, message) => {
    let user;
    try {
      user = (await controller.storage.read([message.user]))[message.user]
      if (user.airtableBase) {
        ReportPrograms(bot, message, key, user.airtableBase);
      }
    } catch (error) {
    }
  });


  const ShowPrograms = async (bot, message, key, base) => {
    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });
    await bot.changeContext(message.reference)
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

  const ReportPrograms = async (bot, message, key, base) => {
    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });
    await bot.changeContext(message.reference)
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