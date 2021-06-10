require('dotenv').config();
const ListCoaches = require("../airtable/coaches") 
module.exports = function(controller) {

  
  controller.hears(new RegExp(/set airtable base (.*?)$/i), ['direct_message'], async (bot, message) => {
    const base = message.matches[1];
    setAirtableBase(bot, message, base);
    return true; 
  });

  controller.hears('show coaches','message,direct_message', async(bot, message) => {
    const key = process.env.AIRTABLE_API_KEY;
    let user;
    try {
      user = (await controller.storage.read([message.user]))[message.user]
      if (user.airtableBase){
        ShowListCoatches(bot, message, key, user.airtableBase);
      }
    } catch (error) {
    }
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
    for await (let coach of coaches) {
      await bot.reply(message, `${coach.FullName} (${coach.Email})`);
    }
  }

  const setAirtableBase = async (bot, message, base) => {
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
        controller.storage.write({[message.user]: { ...user, airtableBase: base, updateAt:Date()}});
        await bot.reply(message, 'Done!');
      }
      else{
        bot.reply(message, 'I do not know you!')
      }      
    } catch (error) {
      bot.reply(message, error.toString())
    }
  }
}
