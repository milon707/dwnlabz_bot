require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TOKEN = process.env.BOT_TOKEN || "8332326285:AAF0FUwGqFMbpDcbDwnDQZhttYybZTbcEiM";
const bot = new TelegramBot(TOKEN, { polling: true });

// ======== /start COMMAND ========
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, '✅ DwnLabz Bot is online!\nSend a YouTube, TikTok, Facebook, or Instagram link to get the download link.');
});

// ======== MESSAGE LISTENER ========
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text.startsWith('/start')) return;

    try {
        if(text.includes('instagram.com')) {
            bot.sendMessage(chatId, 'Processing Instagram link...');
            const downloadLink = `https://www.instadownloader.org/?url=${encodeURIComponent(text)}`;
            bot.sendMessage(chatId, `Download link: ${downloadLink}`);

        } else if(text.includes('youtube.com') || text.includes('youtu.be')) {
            bot.sendMessage(chatId, 'Processing YouTube link...');
            const downloadLink = `https://www.y2mate.com/youtube/${encodeURIComponent(text)}`;
            bot.sendMessage(chatId, `Download link: ${downloadLink}`);

        } else if(text.includes('tiktok.com')) {
            bot.sendMessage(chatId, 'Processing TikTok link...');
            const downloadLink = `https://ssstik.io/en/lookup?url=${encodeURIComponent(text)}`;
            bot.sendMessage(chatId, `Download link: ${downloadLink}`);

        } else if(text.includes('facebook.com')) {
            bot.sendMessage(chatId, 'Processing Facebook link...');
            const downloadLink = `https://www.getfvid.com/downloader/facebook?url=${encodeURIComponent(text)}`;
            bot.sendMessage(chatId, `Download link: ${downloadLink}`);

        } else {
            bot.sendMessage(chatId, '❌ Please send a valid YouTube, TikTok, Facebook, or Instagram link.');
        }
    } catch(err) {
        console.error(err);
        bot.sendMessage(chatId, '⚠️ Error processing link. Try again.');
    }
});

// ======== ERROR HANDLING ========
bot.on("polling_error", (err) => {
    console.error("Polling error:", err);
});
