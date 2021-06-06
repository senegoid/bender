module.exports = function(controller) {

  
  controller.hears(new RegExp(/set airtable base (.*?)$/i), ['direct_message'], async (bot, message) => {
    const base = message.matches[1];

    bot.reply(message, `trying: \`${base}\``);

    let user;
    try {
      user = (await controller.storage.read([message.user]))[message.user]
    } catch (error) {
      let profile = await bot.api.users.info({user: message.user});
      if(profile.ok){
        user = await controller.storage.write({[message.user]: { ...profile.user, updateAt:Date()}});
        user = user[message.user];
      }      
    }

    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'eyes',
    },function(err, res) {
      if (err) {
        bot.botkit.log('Failed to add emoji reaction :(', err);
      }
    });

    await controller.storage.write({[message.user]: { ...user, airtableBase: base, updateAt:Date()}});
    bot.reply(message, 'Done!');
     
  });

  
}

