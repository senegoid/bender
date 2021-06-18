

const blocks = [
  {
    "type": "divider"
  },
  {
    "type": "header",
    "text": {
      "type": "plain_text",
      "text": "Help commands",
      "emoji": true
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*Miscellany*\n    need motivation\n    dm me\n     "
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*USERS*\n    recognize team\n    who am i "
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*AIRTABLE*\n    set airtable base xxxxx\n    set bonus base xxxxxx\n    show base id\n "
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*Airtable Client*\n    report clients\n    client *xxxxx*"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*Airtable Coach*\n    show coaches\n    coach xxxxx"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*Airtable Program*\n    show programs\n    report type of programs"
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*BONUS*\n    sync user bonus\n    distribute x\n    +x to @User for one of (#TeamPlay, #Creativity, #Resilience, #Leadership, #Empowerment) \n        Sample: +15 to @stephen for your pretty #Creativity\n redeem x"
    }
  }
]

module.exports = (controller) => {
  controller.hears(['what do you do', 'help'], 'direct_message,direct_mention,mention', async (bot, message) => {
    await bot.reply(message, { blocks });
    return true;
  });
}