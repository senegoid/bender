module.exports = function(controller) {
  
  controller.hears(new RegExp(/set airtable base (.*?)$/i), ['direct_message'], async (bot, message) => {
    console.log(message);    
    for(var i = 0; i < message.matches.length; i += 1) {
      bot.reply(message, `Match found: \`${message.matches[i]}\``);
    }
  }); 

  controller.hears(['set bases'], 'direct_message,direct_mention,mention', async (bot, message) => {
    let user;
    try {
      user = (await controller.storage.read([message.user]))[message.user]
    } catch (error) {
      let profile = await bot.api.users.info({user: message.user});
      if(profile.ok){
        controller.storage.write({[message.user]: {...profile.user, updateAt:Date()}});
      }      
    }

    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    },function(err, res) {
      if (err) {
        bot.botkit.log('Failed to add emoji reaction :(', err);
      }
    });

    
    bot.reply(message, 'Hello ' + user.real_name + '!!');
     
  });
}

