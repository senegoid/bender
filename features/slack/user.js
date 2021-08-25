const _ = require("lodash");
const { formatUptime } = require("../../helper");

module.exports = async (controller) => {
  controller.hears(['who am i'], 'direct_message,direct_mention,mention', async (bot, message) => {
    recognize(bot, message);
    return true;
  });

  controller.hears(['recognize team'], 'direct_message', async (bot, message) => {
    recognizeTeam(bot, message);
    return true;
  });

  const recognizeTeam = async (bot, message) => {
    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });
    await bot.changeContext(message.reference)

    users = await controller.storage.read([`${message.team}_users`]);
    let slack = await bot.api.users.list();
    if (slack.ok) {
      if (!users[`${message.team}_users`]) {
        const slackUsers = _.keyBy(slack.members, "id");
        controller.storage.write({ [`${message.team}_users`]: slackUsers });
      }
      else {
        users = users[`${message.team}_users`]
        for await (let member of slack.members) {
          users[member.id] = { ...users[member.id], ...member, updateAt: Date() }
        }
        controller.storage.write({ [`${message.team}_users`]: users });
      }
    }
    else {
      bot.reply(message, "Slack not found.")
    }
    bot.reply(message, "Done!")
  }


  const recognize = async (bot, message) => {
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
      }

      let profile = await bot.api.users.info({ user: message.user });
      if (profile.ok) {
        users[message.user] = { ...user, ...profile.user, updateAt: Date() }
        user = users[message.user]
        controller.storage.write({ [`${message.team}_users`]: users });
      }
      await bot.reply(message, 'Hello ' + user.real_name + '!!');
      if (user.profile) {
        if (user.profile.email) {
          await bot.reply(message, `Email: ${user.profile.email}`);
        }
      }
      if (user.is_admin) {
        await bot.reply(message, 'You are admin!');
      }
      if (user.is_owner) {
        await bot.reply(message, 'You are the Boss!');
      }
    } catch (error) {
      await bot.reply(message, error.toString())
    }
  }
}



