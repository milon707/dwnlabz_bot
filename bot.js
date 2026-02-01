require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const ytdl = require('ytdl-core');
const TikTokScraper = require('tiktok-scraper');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// /start কমান্ড
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Hello! Send a YouTube, Facebook public, or TikTok video link to get the download.');
});

// লিঙ্ক প্রসেস
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text.startsWith('/start')) return;

    try {
        if(text.includes('youtube.com') || text.includes('youtu.be')){
            // YouTube ভিডিও
            const info = await ytdl.getInfo(text);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
            bot.sendMessage(chatId, `YouTube video ready: ${format.url}`);
        } else if(text.includes('tiktok.com')){
            // TikTok ভিডিও
            const videoMeta = await TikTokScraper.getVideoMeta(text, { noWaterMark: true });
            bot.sendMessage(chatId, `TikTok video ready: ${videoMeta.videoUrl}`);
        } else if(text.includes('facebook.com')){
            // Facebook public ভিডিও
            const fbUrl = `https://api.fbdwn.com/api?url=${encodeURIComponent(text)}`;
            const res = await axios.get(fbUrl);
            if(res.data && res.data.download){
                bot.sendMessage(chatId, `Facebook video ready: ${res.data.download}`);
            } else {
                bot.sendMessage(chatId, 'Could not get Facebook video.');
            }
        } else {
            bot.sendMessage(chatId, 'Send a valid YouTube, TikTok, or Facebook video link.');
        }
    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, 'Error processing the link.');
    }
});
