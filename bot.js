const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Bot start message
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Hello! DWNLABZ Bot is running.\nSend me an Instagram video link to process.");
});

// Message listener
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore /start again
    if (text.startsWith('/start')) return;

    // Check if it's an Instagram URL
    if (text.includes('instagram.com')) {
        bot.sendMessage(chatId, `Received Instagram link:\n${text}\n\nProcessing...`);

        // Here you can add real download logic later
        // For now, send a sample response
        bot.sendMessage(chatId, "✅ Fake download ready! (Replace this with real logic later)");
    } else {
        bot.sendMessage(chatId, "❌ Please send a valid Instagram link.");
    }
});
