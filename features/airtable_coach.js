require('dotenv').config();
const { ListCoaches, ListClients } = require("../airtable/coaches");

module.exports = function (controller) {
  const key = process.env.AIRTABLE_API_KEY;

  controller.hears('show coaches', 'message,direct_message', async (bot, message) => {
    let user;
    try {
      user = (await controller.storage.read([message.user]))[message.user]
      if (user.airtableBase) {
        ShowListCoatches(bot, message, key, user.airtableBase);
      }
    } catch (error) {
    }
  });

  controller.hears(new RegExp(/coach (.*?)$/i), 'message,direct_message', async (bot, message) => {
    const name = message.matches[1];
    let user;
    try {
      user = (await controller.storage.read([message.user]))[message.user]
      if (user.airtableBase) {
        ShowDetailsCoach(bot, message, key, user.airtableBase, name);
      }
    } catch (error) {
    }

  });


  const ShowListCoatches = async (bot, message, key, base) => {
    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });
    await bot.changeContext(message.reference)
    const coaches = await ListCoaches(key, base);
    const clients = await ListClients(key, base);
    let blocks = []
    let row = 0;
    for await (let coach of coaches) {
      row++;
      const coachClients = clients.filter((client) => client.Coach[0] === coach.id);
      blocks.push({
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `*${coach["Full Name"]}*   ${coach["Coach Level"]}     Fee: ${coach["Coaching Fee Percentage"] * 100}% \n${coach.Email}     Clients: ${coachClients.length}`
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

  const ShowDetailsCoach = async (bot, message, key, base, name) => {
    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });
    await bot.changeContext(message.reference)
    const coaches = await ListCoaches(key, base, name);
    const clients = await ListClients(key, base);
    let blocks = []
    let row = 0;
    for await (let coach of coaches) {
      row++;
      const coachClients = clients.filter((client) => client.Coach[0] === coach.id);
      blocks.push({
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `*${coach["Full Name"]}*   ${coach["Coach Level"]}     Class:${coach.Class}      Fee: ${coach["Coaching Fee Percentage"] * 100}% \n${coach.Email}     Clients: ${coachClients.length} / Cap: ${coach["Coach Client Cap"]}     Birthday:${coach.Birthday}   `
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