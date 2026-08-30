# Telegram Video Player PWA

A simple, clean, and lightweight Progressive Web App (PWA) that allows you to stream and cache the latest video from a private Telegram channel for offline viewing.

## Features

- 🎬 Stream the latest video from a private Telegram channel
- 💾 Cache videos for offline viewing using Service Worker and Cache API
- 📱 Mobile-responsive dark interface
- 🔄 Automatic fallback to cached content when offline
- ⚡ Lightweight - no frameworks, just HTML, CSS, and Vanilla JavaScript
- 🆓 Free hosting on GitHub Pages

## Files

- `index.html` - Main application with video player and Telegram API integration
- `sw.js` - Service Worker for offline functionality and caching
- `README.md` - This file with setup instructions

## Prerequisites

- A Telegram account
- A GitHub account (for free hosting)
- Basic knowledge of using Telegram

## Setup Instructions

### Step 1: Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Start a chat with BotFather by clicking "Start"
3. Send the command `/newbot`
4. Follow the prompts to:
   - Choose a name for your bot (e.g., "My Video Bot")
   - Choose a username for your bot (must end in `bot`, e.g., `my_video_bot`)
5. BotFather will provide you with a **Bot Token** (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
6. **Copy and save this token** - you'll need it later

### Step 2: Create or Select a Private Channel

1. In Telegram, create a new channel (or use an existing private channel)
2. Name your channel (e.g., "My Video Channel")
3. Set it as **Private** (not Public)
4. Upload your first video to this channel

### Step 3: Get Your Channel ID

Since the channel is private, you need to get its ID using a simple method:

**Method 1: Using a Telegram ID Bot**
1. Search for **@userinfobot** or **@GetIDsBot** on Telegram
2. Start the bot
3. Forward any message from your private channel to this bot
4. The bot will reply with the channel ID (format: `-100XXXXXXXXXX`)
5. **Copy and save this ID** - you'll need it later

**Method 2: Using Telegram Web**
1. Open your private channel in Telegram Web (web.telegram.org)
2. Look at the URL - it will contain the channel ID
3. The ID format is typically `-100XXXXXXXXXX`

### Step 4: Add Your Bot to the Channel

1. Go to your private channel
2. Click on the channel name to open channel info
3. Click "Administrators" or "Edit" → "Administrators"
4. Click "Add Administrator"
5. Search for your bot by its username (e.g., `@my_video_bot`)
6. Add the bot as an administrator
7. **Important**: The bot must have permission to read messages in the channel

### Step 5: Configure the Application

1. Open `index.html` in a text editor
2. Find the CONFIG section at the top of the `<script>` tag (around line 180)
3. Replace the placeholder values:
   ```javascript
   const CONFIG = {
       BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE',        // Paste your bot token here
       CHANNEL_ID: 'YOUR_CHANNEL_ID_HERE',      // Paste your channel ID here
       CACHE_NAME: 'telegram-video-cache-v1'
   };
   ```
4. Save the file

### Step 6: Test Locally (Optional)

Before deploying, you can test the application locally:

1. Open `index.html` in your web browser
2. Click "Load Latest Video" to fetch the video from your Telegram channel
3. Click "Cache Video" to download it for offline use
4. Test offline mode by disconnecting from the internet and refreshing the page

**Note**: Service Workers only work on `localhost` or `https://` domains, not `file://` protocol. For full testing, you may need to use a local server like:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with http-server installed)
npx http-server
```

Then open `http://localhost:8000` in your browser.

### Step 7: Deploy to GitHub Pages

#### 7.1 Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the `+` icon in the top-right corner
3. Select "New repository"
4. Name your repository (e.g., `telegram-video-player`)
5. Make it **Public** (required for GitHub Pages free tier)
6. Click "Create repository"

#### 7.2 Upload Your Files

**Option A: Using GitHub Web Interface**
1. In your new repository, click "uploading an existing file"
2. Drag and drop your files:
   - `index.html`
   - `sw.js`
   - `README.md`
3. Add a commit message (e.g., "Initial commit")
4. Click "Commit changes"

**Option B: Using Git Command Line**
```bash
# Navigate to your project directory
cd C:\Users\Moha

# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/telegram-video-player.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### 7.3 Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. In the left sidebar, click "Pages"
4. Under "Build and deployment", select:
   - **Source**: Deploy from a branch
   - **Branch**: `main` (or `master`)
   - **Folder**: `/ (root)`
5. Click "Save"
6. Wait 1-2 minutes for GitHub to deploy your site
7. You'll see your site URL at the top (e.g., `https://YOUR_USERNAME.github.io/telegram-video-player/`)

### Step 8: Install as PWA (Optional)

Once deployed, you can install the app on your device:

**On Desktop (Chrome/Edge):**
1. Open your GitHub Pages URL
2. Click the install icon in the address bar (or go to menu → "Install app")
3. Follow the prompts to install

**On Mobile (Android/iOS):**
1. Open your GitHub Pages URL in Chrome (Android) or Safari (iOS)
2. Tap "Share" and select "Add to Home Screen"
3. The app will be installed with its own icon

## Usage

1. **Load Video**: Click "Load Latest Video" to fetch the most recent video from your Telegram channel
2. **Stream**: Watch the video directly in the player
3. **Cache**: Click "Cache Video" to download it for offline viewing
4. **Offline**: When offline, the app automatically uses the cached version
5. **Clear Cache**: Click "Clear Cache" to remove all cached videos

## Status Indicators

- 🔴 **Red dot**: Connection error or checking status
- 🟢 **Green dot**: Online and ready to stream
- 🔵 **Blue dot**: Video is cached and available offline

## Troubleshooting

### "No video found in the channel"
- Ensure your bot is added as an administrator to the channel
- Verify the channel ID is correct (format: `-100XXXXXXXXXX`)
- Make sure there's at least one video in the channel
- Check that the bot token is correct and not expired

### "Telegram API error"
- Verify your bot token is correct
- Ensure the bot has the necessary permissions
- Check that you're not exceeding Telegram's API rate limits

### Service Worker not working
- Service Workers require HTTPS or localhost
- Clear your browser cache and reload
- Check browser console for errors
- Ensure `sw.js` is in the same directory as `index.html`

### Video not caching
- Ensure you have sufficient storage space
- Check browser console for errors
- Verify the video URL is accessible
- Try clearing the cache and re-caching

### GitHub Pages not updating
- Changes may take 1-2 minutes to propagate
- Clear your browser cache
- Check the GitHub Actions tab for deployment status
- Ensure you're pushing to the correct branch

## Security Notes

⚠️ **Important Security Considerations**:

1. **Bot Token Security**: Your bot token is sensitive. Never commit it to public repositories if possible. Consider:
   - Using environment variables (requires a backend)
   - Keeping the repository private
   - Using a proxy server to hide the token

2. **Private Channel**: This app is designed for private channels. The bot token gives access to your channel's content.

3. **CORS Limitations**: Telegram API has CORS restrictions. This app works because Telegram's file API allows cross-origin requests for file downloads.

## Customization

### Change the UI Theme

Edit the CSS in `index.html` to customize colors, fonts, and layout:

```css
body {
    background: #1a1a1a;  /* Change background color */
    color: #ffffff;      /* Change text color */
}
```

### Add Multiple Channels

Modify the CONFIG section to support multiple channels:

```javascript
const CONFIG = {
    CHANNELS: [
        { id: '-100XXXXXXXXXX', name: 'Channel 1' },
        { id: '-100YYYYYYYYYY', name: 'Channel 2' }
    ],
    // ...
};
```

### Auto-Cache on Load

Add this to the initialization section in `index.html`:

```javascript
// Auto-cache when video loads
videoPlayer.addEventListener('loadeddata', () => {
    cacheVideo();
});
```

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (with some limitations)
- Mobile browsers (Chrome, Safari)

Service Worker support requires modern browsers. Check [caniuse.com](https://caniuse.com/serviceworkers) for compatibility.

## License

This project is open source and available for personal use.

## Contributing

Feel free to fork this project and customize it for your needs.

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your Telegram bot and channel setup
3. Ensure GitHub Pages is correctly configured
4. Review the troubleshooting section above

## Future Enhancements

Potential improvements you could add:
- Support for multiple channels
- Video playlist functionality
- Background sync for automatic updates
- Push notifications for new videos
- Better error handling and retry logic
- IndexedDB for larger video storage
- Video quality selection
- Playback speed controls
- Subtitle support

---

Made with ❤️ for simple, offline video streaming
