// bot.js

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// ======== BOT TOKEN ========
// Local testing এর জন্য সরাসরি টোকেন বসাও
// অথবা Hosting এ ENV variable ব্যবহার করতে পারো
const TOKEN = process.env.BOT_TOKEN || "8332326285:AAF0FUwGqFMbpDcbDwnDQZhttYybZTbcEiM";

const bot = new TelegramBot(TOKEN, { polling: true });

// ======== /start COMMAND ========
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Hello! Bot is running ✅\nSend me an Instagram post link to test.');
});

// ======== MESSAGE LISTENER ========
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore /start messages
    if(text.startsWith('/start')) return;

    // Check for Instagram link
    if(text.includes('instagram.com')) {
        bot.sendMessage(chatId, `Received Instagram link:\n${text}\nProcessing...`);

        // TODO: এখানে পরে real download বা scraping code add করা যাবে
        // এখন fake response দেখাচ্ছে
        setTimeout(() => {
            bot.sendMessage(chatId, '⚠️ Currently, download feature is not active. Only testing the bot.');
        }, 1500);

    } else {
        bot.sendMessage(chatId, '❌ Please send a valid Instagram post URL.');
    }
});

// ======== ERROR HANDLING ========
bot.on("polling_error", (err) => {
    console.error("Polling error:", err);
});
