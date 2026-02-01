require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cheerio = require('cheerio');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// /start command
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, '✅ DwnLabz Bot is online!\nSend a YouTube, TikTok, Facebook, or Instagram link to get the download link.');
});

// Message listener
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text.startsWith('/start')) return;

    try {
        if(text.includes('instagram.com')) {
            bot.sendMessage(chatId, 'Processing Instagram link...');
            // free demo method: just send back original link (later real download logic can be added)
            bot.sendMessage(chatId, `Download link: ${text}`);
        } else if(text.includes('youtube.com') || text.includes('youtu.be')) {
            bot.sendMessage(chatId, 'Processing YouTube link...');
            // demo: just send link
            bot.sendMessage(chatId, `Download link: ${text}`);
        } else if(text.includes('tiktok.com')) {
            bot.sendMessage(chatId, 'Processing TikTok link...');
            bot.sendMessage(chatId, `Download link: ${text}`);
        } else if(text.includes('facebook.com')) {
            bot.sendMessage(chatId, 'Processing Facebook link...');
            bot.sendMessage(chatId, `Download link: ${text}`);
        } else {
            bot.sendMessage(chatId, '❌ Please send a valid YouTube, TikTok, Facebook, or Instagram link.');
        }
    } catch(err) {
        console.log(err);
        bot.sendMessage(chatId, '⚠️ Error processing link. Try again.');
    }
});
