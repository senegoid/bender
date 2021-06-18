const blocks = [
  {
    "type": "image",
    "title": {
      "type": "plain_text",
      "text": "Type of Programs",
      "emoji": true
    },
    "image_url": "https://quickchart.io/chart?c=%7B%0A%20%20type%3A%20%27bar%27%2C%0A%20%20data%3A%20%7B%0A%20%20%20%20labels%3A%20%5B%27Total%20Price%27%5D%2C%0A%20%20%20%20datasets%3A%20%5B%7B%0A%20%20%20%20%20%20label%3A%20%27Guided%27%2C%0A%20%20%20%20%20%20data%3A%20%5B9820%5D%0A%20%20%20%20%7D%2C%20%7B%0A%20%20%20%20%20%20label%3A%20%27Retention%27%2C%0A%20%20%20%20%20%20data%3A%20%5B1500%5D%0A%20%20%20%20%7D%2C%20%7B%0A%20%20%20%20%20%20label%3A%20%27Group%27%2C%0A%20%20%20%20%20%20data%3A%20%5B13200%5D%0A%20%20%20%20%7D%2C%20%7B%0A%20%20%20%20%20%20label%3A%20%27Front%20End%27%2C%0A%20%20%20%20%20%20data%3A%20%5B16550%5D%0A%20%20%20%20%7D%5D%0A%20%20%7D%0A%7D%0A",
    "alt_text": "marg"
  }
]


module.exports = (controller) => {
  controller.hears(['do you do charts'], 'direct_message,direct_mention,mention', async (bot, message) => {
    await bot.reply(message, "Of course, of all kinds");
    await bot.reply(message, { blocks });
    return true;
  });
}