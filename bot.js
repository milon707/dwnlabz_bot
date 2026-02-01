const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// ======== BOT TOKEN ========
const TOKEN = process.env.BOT_TOKEN || "8332326285:AAF0FUwGqFMbpDcbDwnDQZhttYybZTbcEiM";

const bot = new TelegramBot(TOKEN, { 
    polling: true,
    request: {
        timeout: 60000
    }
});

// ======== DOWNLOAD SERVICES CONFIG ========
const DOWNLOAD_SERVICES = {
    INSTAGRAM: {
        name: "Instagram",
        services: [
            {
                name: "InstaDownloader",
                url: (link) => `https://www.instadownloader.org/data.php?url=${encodeURIComponent(link)}`
            },
            {
                name: "SaveFrom.net",
                url: (link) => `https://savefrom.net/downloader?url=${encodeURIComponent(link)}`
            },
            {
                name: "Instagram Video Downloader",
                url: (link) => `https://igram.io/i/${encodeURIComponent(link)}`
            }
        ]
    },
    YOUTUBE: {
        name: "YouTube",
        services: [
            {
                name: "Y2Mate",
                url: (link) => `https://www.y2mate.com/youtube/${encodeURIComponent(link)}`
            },
            {
                name: "SaveFrom.net",
                url: (link) => `https://en.savefrom.net/#url=${encodeURIComponent(link)}`
            },
            {
                name: "Youtube5s",
                url: (link) => `https://yt5s.com/en32?url=${encodeURIComponent(link)}`
            }
        ]
    },
    TIKTOK: {
        name: "TikTok",
        services: [
            {
                name: "SSSTik",
                url: (link) => `https://ssstik.io/en/lookup?url=${encodeURIComponent(link)}`
            },
            {
                name: "TikTokDownloader",
                url: (link) => `https://tikcdn.io/ssstik/${encodeURIComponent(link)}`
            },
            {
                name: "Snaptik",
                url: (link) => `https://snaptik.app/${encodeURIComponent(link)}`
            }
        ]
    },
    FACEBOOK: {
        name: "Facebook",
        services: [
            {
                name: "GetFVID",
                url: (link) => `https://www.getfvid.com/downloader?url=${encodeURIComponent(link)}`
            },
            {
                name: "FBDown",
                url: (link) => `https://fdown.net/downloader.php?url=${encodeURIComponent(link)}`
            },
            {
                name: "Facebook Video Downloader",
                url: (link) => `https://fbdown.net/download.php?url=${encodeURIComponent(link)}`
            }
        ]
    }
};

// ======== HELPER FUNCTIONS ========
function extractPlatform(link) {
    const cleanLink = link.trim().toLowerCase();
    
    if (cleanLink.includes('instagram.com') || cleanLink.includes('instagr.am')) {
        return 'INSTAGRAM';
    } else if (cleanLink.includes('youtube.com') || cleanLink.includes('youtu.be')) {
        return 'YOUTUBE';
    } else if (cleanLink.includes('tiktok.com')) {
        return 'TIKTOK';
    } else if (cleanLink.includes('facebook.com') || cleanLink.includes('fb.watch')) {
        return 'FACEBOOK';
    }
    
    return null;
}

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
}

function getDownloadLinks(platform, link) {
    const platformServices = DOWNLOAD_SERVICES[platform];
    if (!platformServices) return [];
    
    return platformServices.services.map(service => ({
        name: service.name,
        url: service.url(link)
    }));
}

function formatMessage(platform, originalLink, downloadLinks) {
    let message = `🎬 *${DOWNLOAD_SERVICES[platform].name} Download Links*\n\n`;
    message += `🔗 *Original URL:*\n\`${originalLink}\`\n\n`;
    message += `⬇️ *Download Options:*\n\n`;
    
    downloadLinks.forEach((service, index) => {
        message += `${index + 1}. *${service.name}*\n`;
        message += `${service.url}\n\n`;
    });
    
    message += `*📝 Instructions:*\n`;
    message += `1. Click on any download link above\n`;
    message += `2. Follow the instructions on the website\n`;
    message += `3. Choose your preferred quality/format\n\n`;
    message += `💡 *Tips:*\n`;
    message += `• Try different services if one doesn't work\n`;
    message += `• Make sure the content is public\n`;
    message += `• Some services may require ads bypass\n\n`;
    message += `⚠️ *Disclaimer:* Only download content you have permission to download.`;
    
    return message;
}

// ======== /start COMMAND ========
bot.onText(/\/start/, (msg) => {
    const welcomeMessage = `🤖 *Media Downloader Bot*\n\n`
        + `I can help you download videos from:\n`
        + `✅ Instagram\n`
        + `✅ YouTube\n`
        + `✅ TikTok\n`
        + `✅ Facebook\n\n`
        + `*How to use:*\n`
        + `Simply send me a link from any supported platform and I'll provide download options.\n\n`
        + `*Example Links:*\n`
        + `• Instagram: https://instagram.com/p/...\n`
        + `• YouTube: https://youtu.be/...\n`
        + `• TikTok: https://tiktok.com/@.../video/...\n`
        + `• Facebook: https://facebook.com/.../videos/...\n\n`
        + `_Bot is now active and ready!_`;
    
    bot.sendMessage(msg.chat.id, welcomeMessage, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    });
});

// ======== /help COMMAND ========
bot.onText(/\/help/, (msg) => {
    const helpMessage = `🆘 *Help & Support*\n\n`
        + `*Supported Platforms:*\n`
        + `• Instagram: Posts, Reels, Stories\n`
        + `• YouTube: Videos, Shorts\n`
        + `• TikTok: Videos\n`
        + `• Facebook: Videos, Reels\n\n`
        + `*How to Download:*\n`
        + `1. Send me a valid link\n`
        + `2. I'll provide multiple download options\n`
        + `3. Click any link and follow website instructions\n\n`
        + `*Tips:*\n`
        + `• Use direct video/post links\n`
        + `• Make sure content is public\n`
        + `• Try different services if one fails\n\n`
        + `*Commands:*\n`
        + `/start - Start the bot\n`
        + `/help - Show this help\n`
        + `/platforms - Show supported platforms`;
    
    bot.sendMessage(msg.chat.id, helpMessage, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    });
});

// ======== /platforms COMMAND ========
bot.onText(/\/platforms/, (msg) => {
    let platformsMessage = `📱 *Supported Platforms*\n\n`;
    
    Object.keys(DOWNLOAD_SERVICES).forEach(platform => {
        platformsMessage += `*${DOWNLOAD_SERVICES[platform].name}*\n`;
        platformsMessage += `Services: ${DOWNLOAD_SERVICES[platform].services.length}\n`;
        platformsMessage += `Domains: ${platform === 'INSTAGRAM' ? 'instagram.com, instagr.am' : 
                                  platform === 'YOUTUBE' ? 'youtube.com, youtu.be' : 
                                  platform === 'TIKTOK' ? 'tiktok.com, vm.tiktok.com' : 
                                  'facebook.com, fb.watch'}\n\n`;
    });
    
    platformsMessage += `_Send a link from any platform above to get download options._`;
    
    bot.sendMessage(msg.chat.id, platformsMessage, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    });
});

// ======== MESSAGE LISTENER ========
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore commands
    if (!text || text.startsWith('/')) return;
    
    // Show typing indicator
    bot.sendChatAction(chatId, 'typing');

    // Validate URL
    if (!isValidUrl(text)) {
        await bot.sendMessage(chatId, 
            `❌ *Invalid URL*\n\n` +
            `Please send a valid link starting with http:// or https://\n\n` +
            `*Examples:*\n` +
            `• https://instagram.com/p/example\n` +
            `• https://youtu.be/dQw4w9WgXcQ`,
            { parse_mode: 'Markdown' }
        );
        return;
    }

    // Extract platform
    const platform = extractPlatform(text);
    
    if (!platform) {
        await bot.sendMessage(chatId, 
            `❌ *Unsupported Platform*\n\n` +
            `I only support:\n` +
            `• Instagram\n` +
            `• YouTube\n` +
            `• TikTok\n` +
            `• Facebook\n\n` +
            `Send /platforms for more details.`,
            { parse_mode: 'Markdown' }
        );
        return;
    }

    // Get download links
    const downloadLinks = getDownloadLinks(platform, text);
    
    if (downloadLinks.length === 0) {
        await bot.sendMessage(chatId, 
            `⚠️ *Temporarily Unavailable*\n\n` +
            `Sorry, download services for ${DOWNLOAD_SERVICES[platform].name} are currently unavailable.\n` +
            `Please try again later.`,
            { parse_mode: 'Markdown' }
        );
        return;
    }

    // Format and send response
    const message = formatMessage(platform, text, downloadLinks);
    
    // Create inline keyboard with download buttons
    const keyboard = [];
    const row1 = [];
    const row2 = [];
    
    // Add first two services as clickable buttons
    downloadLinks.slice(0, 2).forEach((service, index) => {
        row1.push({
            text: `${index + 1}. ${service.name}`,
            url: service.url
        });
    });
    
    // Add more services if available
    if (downloadLinks.length > 2) {
        downloadLinks.slice(2, 4).forEach((service, index) => {
            row2.push({
                text: `${index + 3}. ${service.name}`,
                url: service.url
            });
        });
    }
    
    if (row1.length > 0) keyboard.push(row1);
    if (row2.length > 0) keyboard.push(row2);

    try {
        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            reply_markup: keyboard.length > 0 ? {
                inline_keyboard: keyboard
            } : undefined
        });
        
        // Send additional tip
        setTimeout(async () => {
            await bot.sendMessage(chatId,
                `💡 *Quick Tip:*\n` +
                `If one service doesn't work, try another one from the list.\n` +
                `Some services work better for certain types of content.`,
                { parse_mode: 'Markdown' }
            );
        }, 1000);
        
    } catch (error) {
        console.error('Error sending message:', error);
        await bot.sendMessage(chatId, 
            `❌ *Error*\n\n` +
            `Failed to send download links. Please try again.\n` +
            `Error: ${error.message}`,
            { parse_mode: 'Markdown' }
        );
    }
});

// ======== ERROR HANDLING ========
bot.on("polling_error", (err) => {
    console.error("Polling error:", err.message || err);
    
    if (err.code === 'EFATAL') {
        console.error("Fatal polling error. Restarting...");
        setTimeout(() => {
            process.exit(1);
        }, 5000);
    }
});

bot.on("error", (err) => {
    console.error("Bot error:", err.message || err);
});

// ======== BOT STARTUP MESSAGE ========
console.log('🤖 Media Downloader Bot is starting...');
console.log('📱 Supported platforms: Instagram, YouTube, TikTok, Facebook');
console.log('🔗 Bot is now listening for messages...');
console.log('='.repeat(50));

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔴 Bot shutting down...');
    bot.stopPolling();
    process.exit(0);
});
