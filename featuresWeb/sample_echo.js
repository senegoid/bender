/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const request = require('request');

module.exports = (controller) => {

    controller.hears('sample', 'message,direct_message', async (bot, message) => {
        await bot.reply(message, 'I heard a sample message.');
    });

    controller.on('message,direct_message', async (bot, message) => {
        await bot.reply(message, `Echo: ${message.text}`);
    });

    controller.hears(['flip'], 'message', async (bot, message) => {
        request.get('http://www.tableflipper.com/json', (e, r, json) => {
            const url = JSON.parse(json);
            bot.reply(message, url.gif);
        });
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
