require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_TOKEN_HERE";
const bot = new TelegramBot(TOKEN, { polling: true });

// Helper function to get download link based on platform
function getDownloadLink(url) {
    if(url.includes('instagram.com')) {
        return `https://www.instadownloader.org/?url=${encodeURIComponent(url)}`;
    } 
    else if(url.includes('youtube.com') || url.includes('youtu.be')) {
        return `https://www.y2mate.com/youtube/${encodeURIComponent(url)}`;
    } 
    else if(url.includes('tiktok.com')) {
        return `https://ssstik.io/en/lookup?url=${encodeURIComponent(url)}`;
    } 
    else if(url.includes('facebook.com')) {
        return `https://www.getfvid.com/downloader/facebook?url=${encodeURIComponent(url)}`;
    }
    return null;
}

// /start command
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `✅ DwnLabz Bot is online!\nSend a YouTube, TikTok, Facebook, or Instagram link to get download link.`);
});

// Message handler
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text.startsWith('/start')) return;

    const downloadLink = getDownloadLink(text);

    if(downloadLink) {
        bot.sendMessage(chatId, `🔗 Here is your download link:\n${downloadLink}`);
    } else {
        bot.sendMessage(chatId, `❌ Send a valid YouTube, TikTok, Facebook, or Instagram link.`);
    }
});

// Polling error handler
bot.on("polling_error", (err) => {
    console.error("Polling error:", err);
});
