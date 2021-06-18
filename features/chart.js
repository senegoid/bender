const sample = {
  "blocks": [
    {
      "type": "image",
      "title": {
        "type": "plain_text",
        "text": "Latest data"
      },
      "block_id": "quickchart-image",
      "image_url": "https://quickchart.io/chart?bkg=white&c=%7B%0A%20%20type%3A%20%27bar%27%2C%0A%20%20data%3A%20%7B%0A%20%20%20%20labels%3A%20%5B%27Week%201%27%2C%20%27Week%202%27%2C%20%27Week%203%27%2C%20%27Week%204%27%5D%2C%0A%20%20%20%20datasets%3A%20%5B%7B%0A%20%20%20%20%20%20label%3A%20%27Retweets%27%2C%0A%20%20%20%20%20%20data%3A%20%5B12%2C%205%2C%2040%2C%205%5D%0A%20%20%20%20%7D%2C%20%7B%0A%20%20%20%20%20%20label%3A%20%27Likes%27%2C%0A%20%20%20%20%20%20data%3A%20%5B80%2C%2042%2C%20215%2C%2030%5D%0A%20%20%20%20%7D%5D%0A%20%20%7D%0A%7D",
      "alt_text": "Chart showing latest data"
    }
  ]
}

module.exports = (controller) => {
  controller.hears(['Do you do charts?'], 'direct_message,direct_mention,mention', async (bot, message) => {
    await bot.reply(message, "Of course, of all kinds");
    await bot.reply(message, blocks);
    return true;
  });
}