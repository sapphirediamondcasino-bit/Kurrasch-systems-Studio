# 🛡️ Game Killer's Security™ v2.0.0

Advanced Discord security and moderation bot with Roblox integration, AI threat detection, and comprehensive server management tools.

## ✨ Features

### 🔨 Moderation
- **Ban/Kick/Warn** - Standard moderation actions
- **Timeout** - Temporary user restrictions
- **Purge** - Bulk message deletion
- **Auto-moderation** - Automatic spam and content filtering

### 🔒 Security
- **User Reports** - Allow members to report violations
- **Security Checks** - View user risk levels and infractions
- **Incident Tracking** - Comprehensive logging system
- **Anti-Raid Protection** - Detect and prevent raid attempts

### 📊 Dashboards
- **Basic Dashboard** - Server statistics and overview
- **Pro Dashboard** - Advanced analytics (Pro tier)
- **Real-time Updates** - Live security monitoring

### 🎮 Roblox Integration
- **Account Linking** - Verify Discord users with Roblox
- **Ban Syncing** - Sync bans between Discord and Roblox
- **Cross-platform Moderation** - Unified user management

### 💎 Subscription Tiers
- **Free** - Basic moderation and security
- **Basic ($4.99/mo)** - Advanced moderation tools
- **Pro ($9.99/mo)** - AI detection, Roblox sync, Pro dashboard
- **Enterprise** - Custom solutions for large communities

### 🤖 AI Detection (Pro)
- Smart spam detection
- Phishing attempt identification
- Toxicity analysis
- Behavioral pattern recognition

## 📦 Installation

### Prerequisites
- Node.js v16.9.0 or higher
- npm v7.0.0 or higher
- Discord Bot Token
- Discord Application Client ID

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/game-killers-security.git
cd game-killers-security
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_bot_client_id_here
GUILD_ID=your_test_guild_id_here  # Optional: for testing
```

4. **Deploy commands to Discord**
```bash
npm run deploy
```

5. **Start the bot**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 🔧 Configuration

Edit `config/config.json` to customize bot settings:

```json
{
  "moderation": {
    "maxWarnings": 3,
    "autoTimeout": false,
    "timeoutDuration": 60
  },
  "security": {
    "antiSpam": { "enabled": true },
    "antiRaid": { "enabled": true }
  }
}
```

## 📝 Commands

### Information
- `/ping` - Check bot latency
- `/help` - View all commands

### Moderation
- `/ban <user> [reason]` - Ban a user
- `/kick <user> [reason]` - Kick a user
- `/warn <user> <reason>` - Warn a user
- `/timeout <user> <duration> [reason]` - Timeout a user
- `/purge <amount> [user]` - Delete messages

### Security
- `/report <user> <reason>` - Report a user
- `/check <user>` - Check user security info
- `/logs [type] [user]` - View security logs

### Dashboard
- `/dashboard` - View server dashboard
- `/prodash` - View Pro dashboard (Pro tier)
- `/settings` - Configure server settings

### Subscription
- `/subscribe` - Manage subscription
- `/features [tier]` - View tier features

### Roblox
- `/verify <username>` - Link Roblox account
- `/unlink` - Unlink Roblox account
- `/syncbans` - Manage ban syncing (Pro tier)

## 🗂️ Project Structure

```
game-killers-security-v2/
├── src/
│   ├── commands/          # Slash commands
│   │   ├── moderation/    # Ban, kick, warn, etc.
│   │   ├── info/          # Ping, help
│   │   ├── security/      # Report, check, logs
│   │   ├── dashboard/     # Dashboards & settings
│   │   ├── subscription/  # Subscription management
│   │   └── roblox/        # Roblox integration
│   ├── events/            # Discord event handlers
│   ├── components/        # Buttons, modals, menus
│   ├── database/          # Database & models
│   ├── services/          # Core services
│   └── utils/             # Helper functions
├── config/                # Configuration files
├── scripts/               # Utility scripts
└── logs/                  # Log files
```

## 🔐 Permissions Required

The bot requires the following permissions:
- View Channels
- Send Messages
- Embed Links
- Read Message History
- Ban Members
- Kick Members
- Timeout Members
- Manage Messages
- Manage Roles (optional)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

Need help? Join our support server:
- Discord: [Support Server](https://discord.gg/your-support-server)
- Documentation: [docs.example.com](https://docs.example.com)
- Issues: [GitHub Issues](https://github.com/yourusername/game-killers-security/issues)

## 📊 Development Status

**Current Version:** v2.0.0

### ✅ Phase 1: Core Functionality (Complete)
- Bot startup and connection
- Command system
- Database system

### ✅ Phase 2: Moderation (Complete)
- Ban, kick, warn, timeout, purge
- User tracking
- Infraction system

### ✅ Phase 3: Dashboards (Complete)
- Basic dashboard
- Pro dashboard
- Settings panel

### ✅ Phase 4: Security & Reports (Complete)
- User reporting system
- Security checks
- Log viewing

### ✅ Phase 5: Subscription System (Complete)
- Tier management
- Feature comparison
- Subscription handling

### ✅ Phase 6: Roblox Integration (Complete)
- Account verification
- Ban syncing
- Cross-platform linking

### 🔄 Phase 7: AI Detection (In Progress)
- AI threat detection
- Advanced analytics
- Predictive insights

## 🙏 Acknowledgments

- Built with [Discord.js](https://discord.js.org/)
- Powered by Node.js
- Inspired by the need for better Discord security

---

**Made with ❤️ by Game Killer Studios**

*Protecting Discord communities, one server at a time.* 🛡️