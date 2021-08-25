/*
3. Need motivation (random phrases);
    - "Success is not final; failure is not fatal: It is the courage to continue that counts." — Winston S. Churchill
    - "It is better to fail in originality than to succeed in imitation." — Herman Melville
    - "The road to success and the road to failure are almost exactly the same." — Colin R. Davis
    - “Success usually comes to those who are too busy looking for it.” — Henry David Thoreau
    - “Develop success from failures. Discouragement and failure are two of the surest stepping stones to success.” —Dale Carnegie

*/
module.exports = function (controller) {

  controller.hears(['hi', 'need motivation'], 'message,direct_message', async (bot, message) => {
    const phrases = [
      `"Success is not final; failure is not fatal: It is the courage to continue that counts." — Winston S. Churchill`,
      `"It is better to fail in originality than to succeed in imitation." — Herman Melville`,
      `"The road to success and the road to failure are almost exactly the same." — Colin R. Davis`,
      `“Success usually comes to those who are too busy looking for it.” — Henry David Thoreau`,
      `“Develop success from failures. Discouragement and failure are two of the surest stepping stones to success.” —Dale Carnegie`,
    ]
    const num = Math.floor(Math.random() * phrases.length)
    const blocks = []
    blocks.push(
      {
        "type": "divider"
      });
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*${phrases[num]}*`
      }
    });
    blocks.push(
      {
        "type": "divider"
      });

    await bot.reply(message, { blocks });
  });

}