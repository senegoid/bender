

module.exports = function(controller) {

    // listen for someone saying 'tasks' to the bot
    // reply with a list of current tasks loaded from the storage system
    // based on this user's id
    controller.hears(['tasks','todo'], 'direct_message', async (bot, message) => {

      // load user from storage...
      const response = await controller.storage.read([`rocket_user_${message.user}`]);

      const user = response[`rocket_user_${message.user}`];

      if (!user || !user.tasks || user.tasks.length == 0) {
        bot.reply(message, 'There are no tasks on your list. Say `add _task_` to add something.');
      } else {
        const text = 'Here are your current tasks: \n' +
        generateTaskList(user) +
        'Reply with `done _number_` to mark a task completed.';

        bot.reply(message, text);

      }

    });

    

    // listen for a user saying "add <something>", and then add it to the user's list
    // store the new list in the storage system
    controller.hears(['add (.*)'],'direct_message', async (bot, message) => {

      const newtask = message.match[1];
      const response = await controller.storage.read([`rocket_user_${message.user}`]);

      let user = response[`rocket_user_${message.user}`];

      if (!user) {
        user = {};
        user.id = `rocket_user_${message.user}`;
        user._id = message.u._id;
        user.tasks = [];
      }

      user.tasks.push(newtask);

      controller.storage.write({ [`rocket_user_${message.user}`]: user });
      bot.reply(message,'Got it.');

    });

    // listen for a user saying "done <number>" and mark that item as done.
    controller.hears(['done (.*)'],'direct_message', async (bot, message) => {

      var number = message.match[1];

      if (isNaN(number)) {
          bot.reply(message, 'Please specify a number.');
      } else {

        // adjust for 0-based array index
        number = parseInt(number) - 1;

        const response = await controller.storage.read([`rocket_user_${message.user}`]);

        let user = response[`rocket_user_${message.user}`];

        if (!user) {
          user = {};
          user.id = `rocket_user_${message.user}`;
          user._id = message.u._id;
          user.tasks = [];
        }

        if (number < 0 || number >= user.tasks.length) {
            bot.reply(message, 'Sorry, your input is out of range. Right now there are ' + user.tasks.length + ' items on your list.');
        } else {

          var item = user.tasks.splice(number,1);

          // reply with a strikethrough message...
          bot.reply(message, '~' + item + '~');

          controller.storage.write({ [`rocket_user_${message.user}`]: user });
          
          if (user.tasks.length > 0) {
            bot.reply(message, 'Here are our remaining tasks:\n' + generateTaskList(user));
          } else {
            bot.reply(message, 'Your list is now empty!');
          }
        }
      }

    });

    // simple function to generate the text of the task list so that
    // it can be used in various places
    function generateTaskList(user) {

        var text = '';

        for (var t = 0; t < user.tasks.length; t++) {
            text = text + '> `' +  (t + 1) + '`) ' +  user.tasks[t] + '\n';
        }

        return text;

    }
}
