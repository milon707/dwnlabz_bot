require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.BOT_TOKEN || "8332326285:AAF0FUwGqFMbpDcbDwnDQZhttYybZTbcEiM";
const bot = new TelegramBot(TOKEN, { polling: true });

// ===== /start =====
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `✅ DwnLabz Bot is online!\nSend a YouTube, TikTok, Facebook, or Instagram link.`);
});

// ===== Message Handler =====
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text.startsWith('/start')) return;

    let downloadLink = null;

    if(text.includes('instagram.com')) {
        downloadLink = `https://www.instadownloader.org/?url=${encodeURIComponent(text)}`;
    } 
    else if(text.includes('youtube.com') || text.includes('youtu.be')) {
        downloadLink = `https://www.y2mate.com/youtube/${encodeURIComponent(text)}`;
    } 
    else if(text.includes('tiktok.com')) {
        downloadLink = `https://ssstik.io/en/lookup?url=${encodeURIComponent(text)}`;
    } 
    else if(text.includes('facebook.com')) {
        downloadLink = `https://www.getfvid.com/downloader/facebook?url=${encodeURIComponent(text)}`;
    } 

    if(downloadLink) {
        bot.sendMessage(chatId, `🔗 Download Link:\n${downloadLink}`);
    } else {
        bot.sendMessage(chatId, `❌ Please send a valid YouTube, TikTok, Facebook, or Instagram link.`);
    }
});

// ===== Polling Error =====
bot.on("polling_error", (err) => {
    console.error("Polling error:", err);
});
