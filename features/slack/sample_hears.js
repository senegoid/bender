const { BotkitConversation } = require('botkit');
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
module.exports = function(controller) {

    
    let convo = new BotkitConversation('tacos', controller);
    convo.say('SOMEONE SAID TACOS!');
    convo.ask('Do you want to eat a taco?', [
        {
            pattern: 'yes',            
            handler: async(response, convo, bot) => {
                await convo.gotoThread('yes_tacos');
            }
        },
        {
            pattern: 'no',
            handler: async(response, convo, bot) => {
                await convo.gotoThread('no_tacos');
            }
        }
    ], 'wants_taco');
    
    convo.addMessage('Hooray for tacos!', 'yes_tacos');
    convo.addMessage('ERROR: Tacos missing!!', 'no_tacos');
    
    convo.after(async(results, bot) => {
    
        // results.wants_taco
    
    })
    
    // add to the controller to make it available for later.
    controller.addDialog(convo);
    
    controller.hears('tacos', 'direct_message', async(bot, message) => {
        await bot.beginDialog('tacos');
    });


}
