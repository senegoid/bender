const {formatUptime} = require("../helper");

module.exports = async (controller) => {
  controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', async (bot, message) => {
    let user;
    try {
      user = (await controller.storage.read([message.user]))[message.user]
    } catch (error) {
      let profile = await bot.api.users.info({user: message.user});
      if(profile.ok){
        user = await controller.storage.write({[message.user]: {...profile.user, updateAt:Date()}});
        console.log(user)
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




