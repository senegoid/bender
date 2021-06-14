require('dotenv').config();
const ListCoaches = require("../airtable/coaches")
module.exports = function (controller) {

  controller.hears(new RegExp(/set airtable base (.*?)$/i), ['direct_message'], async (bot, message) => {
    const base = message.matches[1];
    setAirtableBase(bot, message, base);
    return true;
  });

  controller.hears(new RegExp(/set bonus base (.*?)$/i), ['direct_message'], async (bot, message) => {
    const base = message.matches[1];
    setAirtableBaseBonus(bot, message, base);
    return true;
  });

  controller.hears('show base id', 'message,direct_message', async (bot, message) => {
    let users;
    try {
      users = await controller.storage.read([`${message.team}_users`]);
      let user = {}
      if (users[`${message.team}_users`]) {

        users = users[`${message.team}_users`];

        if (users[message.user]) {
          user = users[message.user];
          if (user.airtableBase) {
            bot.reply(message, `It's ${user.airtableBase}`);
          }
          else {
            bot.reply(message, 'Say: set airtable base xxxxxxxxxxx to choose one.');
          }
        }
        else {
          bot.reply(message, 'I do not know you!')
        }
      }

    } catch (error) {
      bot.reply(message, error.toString())
    }
  });


  const setAirtableBase = async (bot, message, base) => {
    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });
    await bot.changeContext(message.reference)
    let users;
    try {
      users = await controller.storage.read([`${message.team}_users`]);
      let user = {}
      if (users[`${message.team}_users`]) {

        users = users[`${message.team}_users`];

        if (users[message.user]) {
          user = users[message.user];
        }
        users[message.user] = { ...user, airtableBase: base, updateAt: Date() }
        controller.storage.write({ [`${message.team}_users`]: users });
        await bot.reply(message, 'Done!');
      }
      else {
        bot.reply(message, 'I do not know you!')
      }
    } catch (error) {
      bot.reply(message, error.toString())
    }
  }

  const setAirtableBaseBonus = async (bot, message, base) => {
    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });
    await bot.changeContext(message.reference)
    let team;
    try {
      team = await controller.storage.read([message.team]);
      if (team[message.team]) {
        team = team[message.team];
        team = { ...team, airtableBaseBonus: base }
        controller.storage.write({ [message.team]: team });
        await bot.reply(message, 'Done!');
      }
      else {
        bot.reply(message, 'I do not know you!')
      }
    } catch (error) {
      bot.reply(message, error.toString())
    }
  }
}
