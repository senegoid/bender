require('dotenv').config();
const { ListCoaches, ListClients } = require("../airtable/coaches");

module.exports = function (controller) {
  const key = process.env.AIRTABLE_API_KEY;

  controller.hears('show coaches', 'message,direct_message', async (bot, message) => {
    ShowListCoatches(bot, message, key);
    return true;
  });

  controller.hears(new RegExp(/coach (.*?)$/i), 'message,direct_message', async (bot, message) => {
    const name = message.matches[1];
    ShowDetailsCoach(bot, message, key, name);
    return true;
  });


  const ShowListCoatches = async (bot, message, key) => {
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

  const ShowDetailsCoach = async (bot, message, key, name) => {
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