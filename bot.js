require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
    console.error('❌ BOT_TOKEN is required in .env file');
    process.exit(1);
}

const bot = new TelegramBot(TOKEN, { 
    polling: true,
    request: {
        timeout: 60000
    }
});

// Rate limiting configuration
const userCooldown = new Map();
const COOLDOWN_TIME = 5000; // 5 seconds cooldown

// Platform configuration with multiple downloader options
const PLATFORMS = {
    INSTAGRAM: {
        name: 'Instagram',
        domains: ['instagram.com', 'instagr.am', 'www.instagram.com'],
        downloaders: [
            {
                name: 'InstaDownloader',
                url: (url) => `https://www.instadownloader.org/data.php?url=${encodeURIComponent(url)}`
            },
            {
                name: 'SaveFrom',
                url: (url) => `https://savefrom.net/downloader?url=${encodeURIComponent(url)}`
            }
        ],
        regex: /https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel|tv)\/[a-zA-Z0-9_-]+/
    },
    YOUTUBE: {
        name: 'YouTube',
        domains: ['youtube.com', 'youtu.be', 'youtube-nocookie.com', 'www.youtube.com', 'm.youtube.com'],
        downloaders: [
            {
                name: 'Y2Mate',
                url: (url) => `https://www.y2mate.com/youtube/${encodeURIComponent(url)}`
            },
            {
                name: 'SaveFrom',
                url: (url) => `https://en.savefrom.net/#url=${encodeURIComponent(url)}`
            },
            {
                name: 'YoutubeDownloader',
                url: (url) => `https://yt5s.com/en32?url=${encodeURIComponent(url)}`
            }
        ],
        regex: /https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|shorts\/)?[a-zA-Z0-9_-]{11}/
    },
    TIKTOK: {
        name: 'TikTok',
        domains: ['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com', 'www.tiktok.com', 'm.tiktok.com'],
        downloaders: [
            {
                name: 'SSSTik',
                url: (url) => `https://ssstik.io/en/lookup?url=${encodeURIComponent(url)}`
            },
            {
                name: 'TikTokDownloader',
                url: (url) => `https://tikcdn.io/ssstik/${encodeURIComponent(url)}`
            }
        ],
        regex: /https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\/@?[a-zA-Z0-9_.]+\/video\/\d+/
    },
    FACEBOOK: {
        name: 'Facebook',
        domains: ['facebook.com', 'fb.watch', 'fb.com', 'www.facebook.com', 'm.facebook.com'],
        downloaders: [
            {
                name: 'GetFVID',
                url: (url) => `https://www.getfvid.com/downloader?url=${encodeURIComponent(url)}`
            },
            {
                name: 'FBDown',
                url: (url) => `https://fdown.net/downloader.php?url=${encodeURIComponent(url)}`
            }
        ],
        regex: /https?:\/\/(www\.|m\.)?(facebook\.com|fb\.watch)\/(watch\/?\?v=|reel\/|video\/)\d+/
    },
    TWITTER: {
        name: 'Twitter/X',
        domains: ['twitter.com', 'x.com', 'www.twitter.com', 'mobile.twitter.com'],
        downloaders: [
            {
                name: 'TwitterVideoDownloader',
                url: (url) => `https://twdown.net/download.php?url=${encodeURIComponent(url)}`
            },
            {
                name: 'SaveTwitter',
                url: (url) => `https://savetwitter.net/api/download?url=${encodeURIComponent(url)}`
            }
        ],
        regex: /https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/
    }
};

// URL validation utilities
class URLValidator {
    static isValidUrl(url) {
        try {
            const cleanUrl = this.cleanUrl(url);
            const urlObj = new URL(cleanUrl);
            
            // Check protocol
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return false;
            }
            
            // Check domain length
            if (urlObj.hostname.length < 3 || urlObj.hostname.length > 253) {
                return false;
            }
            
            return true;
        } catch {
            return false;
        }
    }

    static cleanUrl(url) {
        return url
            .trim()
            .replace(/^www\./, 'https://')
            .replace(/^(?!https?:\/\/)/, 'https://');
    }

    static extractDomain(url) {
        try {
            const urlObj = new URL(this.cleanUrl(url));
            return urlObj.hostname.replace('www.', '');
        } catch {
            return null;
        }
    }

    static isShortenedUrl(url) {
        const shorteners = [
            'bit.ly', 't.co', 'goo.gl', 'tinyurl.com', 'ow.ly',
            'is.gd', 'buff.ly', 'adf.ly', 'bit.do', 'shorte.st'
        ];
        const domain = this.extractDomain(url);
        return domain ? shorteners.includes(domain) : false;
    }
}

// Link processor class
class LinkProcessor {
    static async detectPlatform(url) {
        const cleanUrl = URLValidator.cleanUrl(url);
        
        // First try regex matching for accuracy
        for (const [platformKey, platform] of Object.entries(PLATFORMS)) {
            if (platform.regex.test(cleanUrl)) {
                return {
                    platform: platform,
                    platformKey: platformKey,
                    url: cleanUrl,
                    method: 'regex'
                };
            }
        }

        // Fallback to domain matching
        const domain = URLValidator.extractDomain(cleanUrl);
        if (domain) {
            for (const [platformKey, platform] of Object.entries(PLATFORMS)) {
                if (platform.domains.some(d => domain.includes(d.replace('www.', '')))) {
                    return {
                        platform: platform,
                        platformKey: platformKey,
                        url: cleanUrl,
                        method: 'domain'
                    };
                }
            }
        }

        return null;
    }

    static async expandShortUrl(url) {
        if (!URLValidator.isShortenedUrl(url)) {
            return url;
        }

        try {
            const response = await axios.head(url, {
                maxRedirects: 5,
                timeout: 10000
            });
            return response.request.res.responseUrl || url;
        } catch (error) {
            try {
                const response = await axios.get(url, {
                    maxRedirects: 5,
                    timeout: 10000,
                    validateStatus: null
                });
                return response.request.res.responseUrl || url;
            } catch {
                return url;
            }
        }
    }

    static async validateUrlAvailability(url) {
        try {
            const response = await axios.head(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return response.status < 400;
        } catch {
            return false;
        }
    }
}

// Download link generator
class DownloadLinkGenerator {
    static generateLinks(platform, originalUrl) {
        const links = [];
        
        for (const downloader of platform.downloaders) {
            links.push({
                name: downloader.name,
                url: downloader.url(originalUrl),
                emoji: '🔗'
            });
        }

        // Add alternative direct downloaders based on platform
        switch(platform.name) {
            case 'YouTube':
                links.push({
                    name: 'YouTubeMP3 (Audio Only)',
                    url: `https://ytmp3.cc/en13/?url=${encodeURIComponent(originalUrl)}`,
                    emoji: '🎵'
                });
                break;
            case 'Instagram':
                links.push({
                    name: 'InstaDP (Profile Picture)',
                    url: `https://www.instadp.com/`,
                    emoji: '👤'
                });
                break;
        }

        return links;
    }

    static formatLinksMessage(platformName, originalUrl, downloadLinks) {
        let message = `✅ *${platformName} Download Links*\n\n`;
        message += `🔗 *Original URL:*\n\`${originalUrl}\`\n\n`;
        message += `⬇️ *Available Download Options:*\n\n`;

        downloadLinks.forEach((link, index) => {
            message += `${link.emoji} *${link.name}:*\n${link.url}\n\n`;
        });

        message += `*Instructions:*\n`;
        message += `1. Click any download link above\n`;
        message += `2. Follow instructions on the website\n`;
        message += `3. Choose quality/format if available\n\n`;
        message += `_💡 Tip: Try different options if one doesn't work_\n`;
        message += `_⚠️ Ensure you have permission to download content_`;

        return message;
    }
}

// Rate limiting middleware
function checkRateLimit(userId) {
    const now = Date.now();
    const lastRequest = userCooldown.get(userId);

    if (lastRequest && (now - lastRequest) < COOLDOWN_TIME) {
        const remaining = Math.ceil((COOLDOWN_TIME - (now - lastRequest)) / 1000);
        return {
            allowed: false,
            remaining: remaining
        };
    }

    userCooldown.set(userId, now);
    return { allowed: true };
}

// Messages
const MESSAGES = {
    WELCOME: `🎬 *DwnLabz Pro Bot* 🤖

✨ *Advanced Media Downloader*
I can help you download content from multiple platforms!

📱 *Supported Platforms:*
${Object.values(PLATFORMS).map(p => `✅ ${p.name}`).join('\n')}

⚡ *Features:*
• Multiple download options per platform
• Short URL expansion
• Link validation
• Rate limiting
• Fast processing

📝 *How to use:*
1. Send me a valid link
2. I'll provide multiple download options
3. Choose your preferred service

⚠️ *Disclaimer:*
Download only content you have rights to. Respect copyright laws.

Type /help for detailed instructions`,

    HELP: `🆘 *Help & Commands*

📋 *Available Commands:*
/start - Start the bot
/help - Show this help message
/platforms - List all supported platforms with examples
/stats - Show bot statistics
/support - Get support information

🔗 *Link Format Examples:*
• YouTube: \`https://youtu.be/dQw4w9WgXcQ\`
• TikTok: \`https://tiktok.com/@user/video/123456789\`
• Instagram: \`https://instagram.com/p/Cxample123/\`
• Facebook: \`https://facebook.com/watch/?v=123456789\`
• Twitter: \`https://twitter.com/user/status/123456789\`

💡 *Tips:*
• Make sure links are public/accessible
• Use direct video/post links
• Try different download options if one fails
• Report broken services with /support

🛡️ *Privacy:*
• No links are stored
• No user data collected
• Processing is temporary`,

    PLATFORMS: `📱 *Supported Platforms Details*

${Object.entries(PLATFORMS).map(([key, platform]) => 
    `*${platform.name}*:\n• Domains: ${platform.domains.slice(0, 3).join(', ')}\n• Example: ${platform.regex.toString().slice(1, 50)}...\n`
).join('\n')}

🔄 *Total Platforms:* ${Object.keys(PLATFORMS).length}
✅ *Status:* All services operational`,

    SUPPORT: `👨‍💻 *Support & Contact*

If you encounter issues:
1. Check if the link is valid and public
2. Try a different download option
3. Wait a few minutes and retry

📧 *Report Issues:*
• Broken download services
• New platform requests
• Bug reports

🔗 *Github:* [DwnLabz-Bot](https://github.com)
📢 *Channel:* @DwnLabzUpdates

_Response time: 24-48 hours_`
};

// Statistics
let botStats = {
    totalRequests: 0,
    successfulDownloads: 0,
    failedDownloads: 0,
    byPlatform: {},
    startTime: Date.now()
};

// Command handlers
bot.onText(/\/start/, async (msg) => {
    await bot.sendMessage(msg.chat.id, MESSAGES.WELCOME, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: {
            inline_keyboard: [
                [{ text: '📱 How to Use', callback_data: 'help' }],
                [{ text: '🔗 Send Link', switch_inline_query_current_chat: '' }]
            ]
        }
    });
});

bot.onText(/\/help/, async (msg) => {
    await bot.sendMessage(msg.chat.id, MESSAGES.HELP, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    });
});

bot.onText(/\/platforms/, async (msg) => {
    await bot.sendMessage(msg.chat.id, MESSAGES.PLATFORMS, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    });
});

bot.onText(/\/support/, async (msg) => {
    await bot.sendMessage(msg.chat.id, MESSAGES.SUPPORT, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    });
});

bot.onText(/\/stats/, async (msg) => {
    const uptime = Math.floor((Date.now() - botStats.startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    let statsMessage = `📊 *Bot Statistics*\n\n`;
    statsMessage += `⏱️ *Uptime:* ${hours}h ${minutes}m\n`;
    statsMessage += `📨 *Total Requests:* ${botStats.totalRequests}\n`;
    statsMessage += `✅ *Successful:* ${botStats.successfulDownloads}\n`;
    statsMessage += `❌ *Failed:* ${botStats.failedDownloads}\n`;
    statsMessage += `📈 *Success Rate:* ${botStats.totalRequests > 0 ? Math.round((botStats.successfulDownloads / botStats.totalRequests) * 100) : 0}%\n\n`;
    
    statsMessage += `*By Platform:*\n`;
    for (const [platform, count] of Object.entries(botStats.byPlatform)) {
        statsMessage += `• ${platform}: ${count}\n`;
    }

    await bot.sendMessage(msg.chat.id, statsMessage, {
        parse_mode: 'Markdown'
    });
});

// Callback query handler
bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;

    if (data === 'help') {
        await bot.editMessageText(MESSAGES.HELP, {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
    }

    await bot.answerCallbackQuery(callbackQuery.id);
});

// Main message handler
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text?.trim();

    // Ignore commands and empty messages
    if (!text || text.startsWith('/')) return;

    botStats.totalRequests++;

    // Check rate limit
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
        await bot.sendMessage(chatId, 
            `⏳ *Please wait ${rateLimit.remaining} seconds before sending another link*`,
            { parse_mode: 'Markdown' }
        );
        return;
    }

    // Show typing indicator
    await bot.sendChatAction(chatId, 'typing');

    try {
        // Step 1: Basic URL validation
        if (!URLValidator.isValidUrl(text)) {
            throw new Error('❌ *Invalid URL format*\nPlease send a valid HTTP/HTTPS link');
        }

        // Step 2: Expand shortened URLs
        const expandedUrl = await LinkProcessor.expandShortUrl(text);
        
        // Step 3: Detect platform
        const platformInfo = await LinkProcessor.detectPlatform(expandedUrl);
        
        if (!platformInfo) {
            throw new Error(
                `❌ *Unsupported Platform*\n\n` +
                `*Supported platforms:*\n` +
                `${Object.values(PLATFORMS).map(p => p.name).join(', ')}\n\n` +
                `Type /platforms for details`
            );
        }

        // Step 4: Validate URL availability
        const isUrlAvailable = await LinkProcessor.validateUrlAvailability(expandedUrl);
        if (!isUrlAvailable) {
            throw new Error(
                `⚠️ *Link may be broken or private*\n\n` +
                `The URL couldn't be accessed. Please check:\n` +
                `• Is the link correct?\n` +
                `• Is the content public?\n` +
                `• Try copying the link again`
            );
        }

        // Step 5: Generate download links
        const downloadLinks = DownloadLinkGenerator.generateLinks(
            platformInfo.platform, 
            expandedUrl
        );

        // Step 6: Send response
        const responseMessage = DownloadLinkGenerator.formatLinksMessage(
            platformInfo.platform.name,
            expandedUrl,
            downloadLinks
        );

        // Add inline keyboard with platform-specific options
        const keyboard = [];
        const row = [];
        
        downloadLinks.slice(0, 3).forEach((link, index) => {
            row.push({
                text: `${link.emoji} ${link.name}`,
                url: link.url
            });
            
            if (row.length === 2 || index === downloadLinks.slice(0, 3).length - 1) {
                keyboard.push([...row]);
                row.length = 0;
            }
        });

        await bot.sendMessage(chatId, responseMessage, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: keyboard
            }
        });

        // Update statistics
        botStats.successfulDownloads++;
        if (!botStats.byPlatform[platformInfo.platform.name]) {
            botStats.byPlatform[platformInfo.platform.name] = 0;
        }
        botStats.byPlatform[platformInfo.platform.name]++;

    } catch (error) {
        botStats.failedDownloads++;
        
        let errorMessage = error.message;
        
        // Add troubleshooting tips for common errors
        if (errorMessage.includes('Unsupported Platform')) {
            errorMessage += `\n\n💡 *Tip:* Make sure you're sending direct post/video links, not profile or home page links.`;
        }
        
        if (errorMessage.includes('broken or private')) {
            errorMessage += `\n\n🔍 *Try:*\n1. Open the link in browser first\n2. Check if it requires login\n3. Try a different link`;
        }

        await bot.sendMessage(chatId, errorMessage, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
    }
});

// Error handlers
bot.on("polling_error", (error) => {
    console.error(`📛 Polling Error: ${error.message}`);
    
    if (error.code === 'EFATAL') {
        console.error('Fatal polling error, attempting restart...');
        setTimeout(() => {
            process.exit(1);
        }, 5000);
    }
});

bot.on("webhook_error", (error) => {
    console.error(`🌐 Webhook Error: ${error.message}`);
});

bot.on("error", (error) => {
    console.error(`⚠️ Bot Error: ${error.message}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔴 Bot shutting down gracefully...');
    bot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🔴 Bot terminated');
    bot.stopPolling();
    process.exit(0);
});

// Bot startup
console.log('\n' + '='.repeat(50));
console.log('🤖 DwnLabz Pro Bot Starting...');
console.log('='.repeat(50));
console.log(`📱 Supported Platforms: ${Object.keys(PLATFORMS).length}`);
console.log(`🔗 Download Services: ${Object.values(PLATFORMS).reduce((sum, p) => sum + p.downloaders.length, 0)}`);
console.log(`🛡️ Features: URL Validation, Rate Limiting, Short URL Expansion`);
console.log('='.repeat(50));
console.log('✅ Bot is ready and listening for messages...\n');
