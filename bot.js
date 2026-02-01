const TelegramBot = require('node-telegram-bot-api');

// ======== BOT TOKEN ========
const TOKEN = process.env.BOT_TOKEN || "8332326285:AAF0FUwGqFMbpDcbDwnDQZhttYybZTbcEiM";
const bot = new TelegramBot(TOKEN, { polling: true });

// ======== DOWNLOAD LINK GENERATORS ========
const LINK_GENERATORS = {
    // Instagram Download Links
    instagram: (url) => [
        {
            name: "📥 InstaDownloader.org",
            link: `https://www.instadownloader.org/data.php?url=${encodeURIComponent(url)}`
        },
        {
            name: "📥 SaveFrom.net",
            link: `https://savefrom.net/downloader?url=${encodeURIComponent(url)}`
        },
        {
            name: "📥 Instagram Video Downloader",
            link: `https://igram.io/i/${encodeURIComponent(url)}`
        },
        {
            name: "📥 InstaLoad",
            link: `https://www.instaload.com/?url=${encodeURIComponent(url)}`
        }
    ],

    // YouTube Download Links
    youtube: (url) => [
        {
            name: "🎬 Y2Mate.com",
            link: `https://www.y2mate.com/youtube/${getYouTubeID(url)}`
        },
        {
            name: "🎬 SaveFrom.net",
            link: `https://en.savefrom.net/#url=${encodeURIComponent(url)}`
        },
        {
            name: "🎬 YT5s.com",
            link: `https://yt5s.com/en32?url=${encodeURIComponent(url)}`
        },
        {
            name: "🎵 YouTube to MP3",
            link: `https://ytmp3.cc/en13/?url=${encodeURIComponent(url)}`
        }
    ],

    // TikTok Download Links
    tiktok: (url) => [
        {
            name: "📱 SSSTik.io",
            link: `https://ssstik.io/en/lookup?url=${encodeURIComponent(url)}`
        },
        {
            name: "📱 TikTokDownloader.com",
            link: `https://www.tiktokdownloader.com/?url=${encodeURIComponent(url)}`
        },
        {
            name: "📱 SnapTik.app",
            link: `https://snaptik.app/${encodeURIComponent(url)}`
        },
        {
            name: "📱 MusicalDown.com",
            link: `https://musicaldown.com/download?url=${encodeURIComponent(url)}`
        }
    ],

    // Facebook Download Links
    facebook: (url) => [
        {
            name: "📘 GetFVID.com",
            link: `https://www.getfvid.com/downloader?url=${encodeURIComponent(url)}`
        },
        {
            name: "📘 FBDown.net",
            link: `https://fbdown.net/download.php?url=${encodeURIComponent(url)}`
        },
        {
            name: "📘 FacebookVideoDownload.net",
            link: `https://facebookvideodownload.net/?url=${encodeURIComponent(url)}`
        },
        {
            name: "📘 DownFacebook.net",
            link: `https://downfacebook.net/?url=${encodeURIComponent(url)}`
        }
    ],

    // Twitter/X Download Links
    twitter: (url) => [
        {
            name: "🐦 TwitterVideoDownloader.net",
            link: `https://twdown.net/download.php?url=${encodeURIComponent(url)}`
        },
        {
            name: "🐦 SaveTwitter.net",
            link: `https://savetwitter.net/api/download?url=${encodeURIComponent(url)}`
        },
        {
            name: "🐦 Twittervideodownloader.com",
            link: `https://twittervideodownloader.com/?url=${encodeURIComponent(url)}`
        }
    ]
};

// ======== HELPER FUNCTIONS ========
function getYouTubeID(url) {
    const patterns = [
        /youtube\.com\/watch\?v=([^&]+)/,
        /youtu\.be\/([^?]+)/,
        /youtube\.com\/embed\/([^?]+)/,
        /youtube\.com\/shorts\/([^?]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return encodeURIComponent(url);
}

function detectPlatform(url) {
    const cleanUrl = url.toLowerCase();
    
    if (cleanUrl.includes('instagram.com') || cleanUrl.includes('instagr.am')) {
        return 'instagram';
    } else if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
        return 'youtube';
    } else if (cleanUrl.includes('tiktok.com')) {
        return 'tiktok';
    } else if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) {
        return 'facebook';
    } else if (cleanUrl.includes('twitter.com') || cleanUrl.includes('x.com')) {
        return 'twitter';
    }
    
    return null;
}

function isValidURL(string) {
    try {
        return Boolean(new URL(string));
    } catch {
        return false;
    }
}

// ======== /start COMMAND ========
bot.onText(/\/start/, (msg) => {
    const welcomeMsg = `✨ *Download Link Generator Bot* ✨\n\n`
        + `📱 আমি আপনাকে *ডাউনলোড লিংক* তৈরি করে দিব!\n\n`
        + `✅ *সাপোর্টেড প্ল্যাটফর্ম:*\n`
        + `• Instagram (পোস্ট, রিল, IGTV)\n`
        + `• YouTube (ভিডিও, শর্টস)\n`
        + `• TikTok (ভিডিও)\n`
        + `• Facebook (ভিডিও, রিল)\n`
        + `• Twitter/X (ভিডিও)\n\n`
        + `📌 *ব্যবহার করার নিয়ম:*\n`
        + `1. আমাকে কোন ভিডিও লিংক পাঠান\n`
        + `2. আমি ৩-৪টি ডাউনলোড লিংক দিব\n`
        + `3. যেকোনো লিংকে ক্লিক করে ডাউনলোড করুন\n\n`
        + `⚠️ *লিংক পাঠানোর সময় নিশ্চিত করুন:*\n`
        + `• ভিডিওটি পাবলিক আছে\n`
        + `• সঠিক লিংক পাঠাচ্ছেন\n`
        + `• কোনো প্রাইভেট ভিডিও না\n\n`
        + `_🚀 বটটি এখন একটিভ, লিংক পাঠান..._`;
    
    bot.sendMessage(msg.chat.id, welcomeMsg, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: {
            keyboard: [
                [{ text: "📱 How to Use" }],
                [{ text: "🔗 Example Links" }],
                [{ text: "📞 Support" }]
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    });
});

// ======== /help COMMAND ========
bot.onText(/\/help/, (msg) => {
    const helpMsg = `🆘 *সাহায্য কেন্দ্র*\n\n`
        + `*উদাহরণ লিংক:*\n`
        + `• Instagram: https://www.instagram.com/p/EXAMPLE/\n`
        + `• YouTube: https://youtu.be/EXAMPLE\n`
        + `• TikTok: https://tiktok.com/@user/video/123456\n`
        + `• Facebook: https://facebook.com/watch/?v=123456\n`
        + `• Twitter: https://twitter.com/user/status/123456\n\n`
        + `*ট্রাবলশুটিং:*\n`
        + `❌ লিংক কাজ না করলে?\n`
        + `→ অন্য একটি ডাউনলোডার চেষ্টা করুন\n\n`
        + `❌ ডাউনলোড শুরু না হলে?\n`
        + `→ ব্রাউজার change করুন (Chrome/Firefox)\n\n`
        + `❌ ভিডিও না দেখালে?\n`
        + `→ ভিডিওটি পাবলিক কিনা check করুন\n\n`
        + `📞 সমস্যা হলে: @YourSupportUsername`;
    
    bot.sendMessage(msg.chat.id, helpMsg, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    });
});

// ======== /example COMMAND ========
bot.onText(/\/example/, (msg) => {
    const examples = `📋 *উদাহরণ লিংক*\n\n`
        + `*Instagram:*\n\`https://www.instagram.com/p/Cxample123/\`\n\n`
        + `*YouTube:*\n\`https://youtu.be/dQw4w9WgXcQ\`\n\n`
        + `*TikTok:*\n\`https://www.tiktok.com/@example/video/123456789\`\n\n`
        + `*Facebook:*\n\`https://www.facebook.com/watch/?v=123456789\`\n\n`
        + `*Twitter:*\n\`https://twitter.com/example/status/123456789\`\n\n`
        + `_এই ধরনের লিংক আমাকে পাঠান_`;
    
    bot.sendMessage(msg.chat.id, examples, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    });
});

// ======== MESSAGE HANDLER ========
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore commands
    if (!text || text.startsWith('/')) return;

    // Quick reply buttons
    if (text === "📱 How to Use") {
        bot.sendMessage(chatId, "সহজ! আমাকে Instagram, YouTube, TikTok, Facebook বা Twitter এর যেকোনো ভিডিও লিংক পাঠান। আমি ডাউনলোড লিংক দিব।");
        return;
    }
    if (text === "🔗 Example Links") {
        bot.sendMessage(chatId, "Instagram: https://www.instagram.com/p/EXAMPLE/\nYouTube: https://youtu.be/EXAMPLE\nTikTok: https://tiktok.com/@user/video/123456");
        return;
    }
    if (text === "📞 Support") {
        bot.sendMessage(chatId, "সমস্যা হলে যোগাযোগ করুন: @YourSupportUsername\nঅথবা @YourChannel");
        return;
    }

    // Show typing indicator
    bot.sendChatAction(chatId, 'typing');

    // Validate URL
    if (!isValidURL(text)) {
        setTimeout(() => {
            bot.sendMessage(chatId, 
                `❌ *ইনভ্যালিড লিংক*\n\n`
                + `দয়া করে একটি সঠিক লিংক পাঠান।\n\n`
                + `*সঠিক ফরম্যাট:*\n`
                + `\`https://instagram.com/p/example\`\n`
                + `\`https://youtu.be/example\`\n\n`
                + `/example - উদাহরণ দেখুন`,
                { parse_mode: 'Markdown' }
            );
        }, 1000);
        return;
    }

    // Detect platform
    const platform = detectPlatform(text);
    
    if (!platform) {
        setTimeout(() => {
            bot.sendMessage(chatId,
                `❌ *সাপোর্টেড না*\n\n`
                + `এই লিংকের জন্য সাপোর্ট নেই।\n\n`
                + `*সাপোর্টেড প্ল্যাটফর্ম:*\n`
                + `• Instagram\n• YouTube\n• TikTok\n• Facebook\n• Twitter/X\n\n`
                + `অন্য লিংক পাঠান।`,
                { parse_mode: 'Markdown' }
            );
        }, 1000);
        return;
    }

    // Generate download links
    const downloadLinks = LINK_GENERATORS[platform](text);
    const platformNames = {
        'instagram': 'Instagram',
        'youtube': 'YouTube', 
        'tiktok': 'TikTok',
        'facebook': 'Facebook',
        'twitter': 'Twitter/X'
    };

    // Create message with download links
    let message = `✅ *${platformNames[platform]} ডাউনলোড লিংক*\n\n`;
    message += `🔗 *আপনার লিংক:*\n\`${text}\`\n\n`;
    message += `⬇️ *নিচের লিংকগুলোতে ক্লিক করে ডাউনলোড করুন:*\n\n`;

    downloadLinks.forEach((link, index) => {
        message += `${index + 1}. *${link.name}*\n`;
        message += `${link.link}\n\n`;
    });

    message += `📝 *ইনস্ট্রাকশন:*\n`;
    message += `1. উপরের যেকোনো লিংকে ক্লিক করুন\n`;
    message += `2. ওয়েবসাইটে ভিডিও দেখাবে\n`;
    message += `3. "Download" বাটনে ক্লিক করুন\n`;
    message += `4. ভিডিওটি আপনার ডিভাইসে সেভ হবে\n\n`;
    message += `💡 *টিপস:*\n`;
    message += `• প্রথম লিংক কাজ না করলে দ্বিতীয়টি চেষ্টা করুন\n`;
    message += `• কিছু সাইটে "Skip Ad" ক্লিক করতে হতে পারে\n`;
    message += `• ভিডিওটি অবশ্যই পাবলিক থাকতে হবে\n\n`;
    message += `⚠️ *শুধুমাত্র ব্যক্তিগত ব্যবহারের জন্য*`;

    // Create inline keyboard with download buttons
    const inlineKeyboard = [];
    const row1 = [];
    const row2 = [];

    // Add first 2 links as buttons
    downloadLinks.slice(0, 2).forEach((link, index) => {
        row1.push({
            text: `${index + 1}. ${link.name}`,
            url: link.link
        });
    });

    // Add next 2 links if available
    downloadLinks.slice(2, 4).forEach((link, index) => {
        row2.push({
            text: `${index + 3}. ${link.name}`,
            url: link.link
        });
    });

    if (row1.length > 0) inlineKeyboard.push(row1);
    if (row2.length > 0) inlineKeyboard.push(row2);

    // Send the message with buttons
    setTimeout(async () => {
        try {
            await bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
                reply_markup: {
                    inline_keyboard: inlineKeyboard
                }
            });

            // Send a follow-up tip
            setTimeout(() => {
                bot.sendMessage(chatId,
                    `💡 *দ্রুত টিপ:*\n`
                    + `লিংক ওপেন হলে "Download" বাটন খুঁজুন। কিছু সাইটে:\n`
                    + `• "Download Video"\n`
                    + `• "Save Video"\n`
                    + `• "Download Now"\n`
                    + `লিখা বাটনে ক্লিক করুন।`,
                    { parse_mode: 'Markdown' }
                );
            }, 1500);

        } catch (error) {
            console.error('Error sending message:', error);
            bot.sendMessage(chatId, 
                `❌ *একটি এরর হয়েছে*\n\n`
                + `দুঃখিত, লিংক তৈরি করতে সমস্যা হচ্ছে।\n`
                + `অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।`,
                { parse_mode: 'Markdown' }
            );
        }
    }, 1500);
});

// ======== ERROR HANDLING ========
bot.on("polling_error", (err) => {
    console.error("Polling error:", err.message || err);
});

bot.on("error", (err) => {
    console.error("Bot error:", err.message || err);
});

// ======== STARTUP MESSAGE ========
console.log('===================================');
console.log('🤖 Download Link Generator Bot Started!');
console.log('📱 Platforms: Instagram, YouTube, TikTok, Facebook, Twitter');
console.log('🔗 Features: Direct download links, No API required');
console.log('🚀 Bot is ready to receive links...');
console.log('===================================');

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔴 Bot is shutting down...');
    bot.stopPolling();
    process.exit(0);
});
