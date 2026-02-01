require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const ytdl = require('ytdl-core'); // YouTube
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Hello bot running! Send me a YouTube, Facebook, or TikTok link.');
});

// Helper: send file via Telegram
async function sendVideo(chatId, filePath, fileName) {
    try {
        await bot.sendVideo(chatId, filePath, { filename: fileName });
        fs.unlinkSync(filePath); // clean up after sending
    } catch (err) {
        bot.sendMessage(chatId, 'Error sending video. Try again.');
    }
}

// Link listener
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text.startsWith('/start')) return;

    if (!text.includes('youtube.com') && !text.includes('fb.watch') && !text.includes('tiktok.com')) {
        bot.sendMessage(chatId, 'Send a valid YouTube, Facebook, or TikTok link.');
        return;
    }

    bot.sendMessage(chatId, 'Processing your link, please wait...');

    try {
        let tempPath = path.join(__dirname, 'temp_video.mp4');

        // YouTube
        if (text.includes('youtube.com')) {
            const info = await ytdl.getInfo(text);
            const stream = ytdl(text, { quality: 'highest' });
            const writeStream = fs.createWriteStream(tempPath);
            stream.pipe(writeStream);
            writeStream.on('finish', () => sendVideo(chatId, tempPath, `${info.videoDetails.title}.mp4`));
        }
        // TikTok or FB (public only)
        else if (text.includes('tiktok.com') || text.includes('fb.watch')) {
            // Use a free service for public videos
            const response = await axios.post('https://api.vevioz.com/api/ajax/download', { url: text });
            if (response.data && response.data.url) {
                bot.sendMessage(chatId, `Download link: ${response.data.url}`);
            } else {
                bot.sendMessage(chatId, 'Could not generate download link for this video.');
            }
        }
    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, 'Error processing the video. Make sure the link is public and correct.');
    }
});
