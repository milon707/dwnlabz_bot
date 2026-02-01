require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_TOKEN_HERE";
const bot = new TelegramBot(TOKEN, { polling: true });

// Platform configuration
const PLATFORMS = {
    INSTAGRAM: {
        name: 'Instagram',
        domains: ['instagram.com', 'instagr.am'],
        downloader: (url) => `https://www.instadownloader.org/?url=${encodeURIComponent(url)}`
    },
    YOUTUBE: {
        name: 'YouTube',
        domains: ['youtube.com', 'youtu.be', 'youtube-nocookie.com'],
        downloader: (url) => `https://www.y2mate.com/youtube/${encodeURIComponent(url)}`
    },
    TIKTOK: {
        name: 'TikTok',
        domains: ['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'],
        downloader: (url) => `https://ssstik.io/en/lookup?url=${encodeURIComponent(url)}`
    },
    FACEBOOK: {
        name: 'Facebook',
        domains: ['facebook.com', 'fb.watch', 'fb.com'],
        downloader: (url) => `https://www.getfvid.com/downloader/facebook?url=${encodeURIComponent(url)}`
    }
};

// Helper function to detect platform and get download link
function getDownloadInfo(url) {
    try {
        // Remove any extra whitespace
        const cleanUrl = url.trim();
        
        // Check if URL is valid
        if (!isValidUrl(cleanUrl)) {
            return { success: false, error: 'Invalid URL format' };
        }

        // Detect platform
        for (const [platformKey, platform] of Object.entries(PLATFORMS)) {
            for (const domain of platform.domains) {
                if (cleanUrl.includes(domain)) {
                    return {
                        success: true,
                        platform: platform.name,
                        downloadLink: platform.downloader(cleanUrl),
                        originalUrl: cleanUrl
                    };
                }
            }
        }

        return { 
            success: false, 
            error: 'Unsupported platform',
            supportedPlatforms: Object.values(PLATFORMS).map(p => p.name).join(', ')
        };
    } catch (error) {
        return { success: false, error: 'Error processing URL' };
    }
}

// URL validation helper
function isValidUrl(string) {
    try {
        // Basic URL validation
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-\.~:?#\[\]@!$&'()*+,;=]*)?$/;
        return urlPattern.test(string);
    } catch {
        return false;
    }
}

// Welcome message
const WELCOME_MESSAGE = `🎬 *DwnLabz Bot*

I can help you download content from various platforms!

*Supported Platforms:*
✅ YouTube
✅ TikTok  
✅ Instagram
✅ Facebook

*How to use:*
1. Send me a link from any supported platform
2. I'll provide you with a direct download link

_Note: This bot provides third-party download links. Make sure you have the right to download the content._

Type /help for more information`;

// Help message
const HELP_MESSAGE = `🆘 *Help & Instructions*

*Available Commands:*
/start - Start the bot
/help - Show this help message
/platforms - List all supported platforms

*Usage Examples:*
• YouTube: \`https://youtu.be/example\`
• TikTok: \`https://tiktok.com/@user/video\`
• Instagram: \`https://instagram.com/p/example/\`
• Facebook: \`https://facebook.com/watch/?v=example\`

*Important Notes:*
• Only send direct links to posts/videos
• Make sure links are public/accessible
• Downloading copyrighted content without permission may be illegal in your region

_For issues, contact the bot administrator._`;

// Platforms message
const PLATFORMS_MESSAGE = `📱 *Supported Platforms*

${Object.values(PLATFORMS).map(platform => 
    `• *${platform.name}*: ${platform.domains.join(', ')}`
).join('\n')}

_Total: ${Object.keys(PLATFORMS).length} platforms supported_`;

// /start command
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, WELCOME_MESSAGE, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
    });
});

// /help command
bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, HELP_MESSAGE, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
    });
});

// /platforms command  
bot.onText(/\/platforms/, (msg) => {
    bot.sendMessage(msg.chat.id, PLATFORMS_MESSAGE, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
    });
});

// Message handler with better validation
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    // Ignore commands and empty messages
    if (!text || text.startsWith('/')) return;

    // Show typing indicator
    bot.sendChatAction(chatId, 'typing');

    const downloadInfo = getDownloadInfo(text);

    if (downloadInfo.success) {
        const responseMessage = `✅ *${downloadInfo.platform} Download Link*

🔗 *Original URL:*
\`${downloadInfo.originalUrl}\`

⬇️ *Download Link:*
${downloadInfo.downloadLink}

*Instructions:*
1. Click the download link above
2. Follow the instructions on the website
3. Download your content

_Note: The download link is provided by a third-party service._`;

        bot.sendMessage(chatId, responseMessage, { 
            parse_mode: 'Markdown',
            disable_web_page_preview: true 
        });
    } else {
        let errorMessage = `❌ *Error*: ${downloadInfo.error}`;
        
        if (downloadInfo.supportedPlatforms) {
            errorMessage += `\n\n📱 *Supported Platforms:*\n${downloadInfo.supportedPlatforms}`;
        }
        
        errorMessage += `\n\nType /help for usage instructions.`;
        
        bot.sendMessage(chatId, errorMessage, { 
            parse_mode: 'Markdown',
            disable_web_page_preview: true 
        });
    }
});

// Error handlers
bot.on("polling_error", (err) => {
    console.error("Polling error:", err.message || err);
});

bot.on("webhook_error", (err) => {
    console.error("Webhook error:", err.message || err);
});

// Bot info
console.log('🤖 DwnLabz Bot is running...');
console.log('📱 Supported platforms:', Object.values(PLATFORMS).map(p => p.name).join(', '));
