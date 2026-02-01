require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const ytdl = require('ytdl-core'); // YouTube download

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// /start command
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Hello bot running!');
});

// Message listener
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore /start command
    if(text.startsWith('/start')) return;

    // Simple link detection
    try {
        if(text.includes('youtube.com') || text.includes('youtu.be')) {
            bot.sendMessage(chatId, 'Processing YouTube link...');
            const info = await ytdl.getInfo(text);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
            bot.sendMessage(chatId, `Download link: ${format.url}`);
        } 
        else if(text.includes('tiktok.com')) {
            bot.sendMessage(chatId, 'Processing TikTok link...');
            const apiUrl = `https://api.tikmate.app/api/lookup?url=${text}`;
            const response = await axios.get(apiUrl);
            if(response.data && response.data.video[0]) {
                bot.sendMessage(chatId, `Download link: ${response.data.video[0].url}`);
            } else {
                bot.sendMessage(chatId, 'Cannot get TikTok video.');
            }
        } 
        else if(text.includes('facebook.com')) {
            bot.sendMessage(chatId, 'Processing Facebook link...');
            // Using fbdown.net unofficial API
            const apiUrl = `https://www.fbdown.net/download?url=${encodeURIComponent(text)}`;
            bot.sendMessage(chatId, `Download link: ${apiUrl}`);
        } 
        else if(text.includes('instagram.com')) {
            bot.sendMessage(chatId, 'Processing Instagram link...');
            // Using instagram-scraper free endpoint
            const apiUrl = `https://api.iinsta.net/api?url=${encodeURIComponent(text)}`;
            const response = await axios.get(apiUrl);
            if(response.data && response.data.media_url) {
                bot.sendMessage(chatId, `Download link: ${response.data.media_url}`);
            } else {
                bot.sendMessage(chatId, 'Cannot get Instagram media.');
            }
        } 
        else {
            bot.sendMessage(chatId, 'Send a valid YouTube, TikTok, Facebook, or Instagram link.');
        }
    } catch(err) {
        console.log(err);
        bot.sendMessage(chatId, 'Error processing the link.');
    }
});
