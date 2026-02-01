const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Hello bot running!');
});

// Link listener
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore /start
    if(text.startsWith('/start')) return;

    // Simple check for Instagram URL
    if(text.includes('instagram.com')) {
        // এখানে এখন fake response, পরে real download add করা যাবে
        bot.sendMessage(chatId, `Received Instagram link: ${text}\nProcessing...`);
    } else {
        bot.sendMessage(chatId, 'Send a valid Instagram link.');
    }
});
