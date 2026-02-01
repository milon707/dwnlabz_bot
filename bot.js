const TelegramBot = require('node-telegram-bot-api');

// যদি Environment Variable থাকে, সেটি নাও, নাহলে সরাসরি Token ব্যবহার করো
const token = process.env.BOT_TOKEN || '8332326285:AAF0FUwGqFMbpDcbDwnDQZhttYybZTbcEiM';

const bot = new TelegramBot(token, { polling: true });

// /start কমান্ড handle করা
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Hello! Bot is running.');
});

// এখানে তোমরা পরে চাইলে আরও কমান্ড বা ফাংশন অ্যাড করতে পারো
bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, 'This is a demo download bot. Commands will be added soon.');
});