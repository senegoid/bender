const {formatUptime} = require("../helper");

module.exports = async (controller) => {
  controller.hears(['who am i', 'hi'], 'direct_message,direct_mention,mention', async (bot, message) => {
    recognize(bot, message);
    return true;
  });


  const recognize = async (bot, message) => {
    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'robot_face',
    });
    await bot.changeContext(message.reference)
    let user;
    try {
      user = await controller.storage.read([message.user]);
      if (user[message.user]){
        user = user[message.user];
      }
      
      let profile = await bot.api.users.info({user: message.user}); 
      if(profile.ok){
        user = {...user, ...profile.user, updateAt:Date()}
        controller.storage.write({[message.user]: user});        
      }      
      await bot.reply(message, 'Hello ' + user.real_name + '!!');
      if(user.profile){
        if(user.profile.email){
          await bot.reply(message, `Email: ${user.profile.email}`);
        }
      }
      if(user.is_admin){
        await bot.reply(message, 'You are admin!');
      }
      if(user.is_owner){
        await bot.reply(message, 'You are the Boss!');
      }      
    } catch (error) {
      await bot.reply(message, error.toString())
    }
  }
}



