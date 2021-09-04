const NotionGit = require('../../notion/github'); 
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = (controller) => {

    controller.hears('sample', 'message,direct_message', async (bot, message) => {
        await bot.reply(message, 'I heard a sample message.');
    });

    controller.hears('sync roadmap', 'message,direct_message', async (bot, message) => {
        await NotionGit.sync();
        await bot.reply(message, 'done');
    });

    controller.hears('update me', 'message', async (bot, message) => {

        let reply = await bot.reply(message, 'reply');
        await controller.adapter.updateActivity(bot.getConfig('context'), {
            text: 'UPDATED!',
            ...message.incoming_message,
            ...reply
        });

    });




}
