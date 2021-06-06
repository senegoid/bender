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
        user = {...profile.user, updateAt:Date()}
        await controller.storage.write({[message.user]: user});
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

  controller.hears('show base id','message,direct_message', async(bot, message) => {
    let user;
    try {
      user = (await controller.storage.read([message.user]))[message.user]
      if (user.airtableBase){
        bot.reply(message, `It's ${user.airtableBase}`);
      }
      else{
        bot.reply(message, 'Say: set artable base xxxxxxxxxxx to choose one.');
      }

    } catch (error) {
      bot.reply(message, 'I do not know you!')
    }
  });  
}

