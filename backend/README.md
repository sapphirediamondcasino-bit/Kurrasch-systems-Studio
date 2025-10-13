# Game Killers Studio - Backend

Complete backend implementation for Game Killers Studio - A social platform for game developers with AI avatars, subscriptions, badges, and community features.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sapphirediamondcasino-bit/Kurrasch-systems-Studio.git
cd Kurrasch-systems-Studio/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. **Initialize datastore**
```bash
npm run init
```

5. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Project Structure

```
backend/
├── server.js                 # Main server file
├── package.json             # Dependencies
├── .env                     # Environment variables
├── datastore/              # JSON database
├── routes/                 # API route handlers
├── middleware/             # Authentication & validation
├── utils/                  # Helper functions & workers
├── ai/                     # AI avatar personalities
├── scripts/                # Initialization scripts
└── uploads/                # User uploads
```

## 🔑 Admin Access

Two emails are automatically granted admin access with Founder Badge, Org Badge, and Tier 5 subscription:

- **gamekillerszone@gmail.com** (Group Admin)
- **tannerkurrach@gmail.com** (Creator Admin)

## 🤖 AI Mini Avatars

12 AI-powered celebrity personalities that act as real users on the platform:

1. Betty White
2. Robin Williams
3. Johnny Hardwick (Dale Gribble)
4. Jonathan Joss (John Redcorn)
5. Diane Keaton
6. Shelley Duvall
7. Michelle Trachtenberg
8. James Earl Jones
9. Matthew Perry
10. John Candy
11. Chris Farley
12. Harold Ramis

**Features:**
- Chat with users (public, no friend requirement)
- Create posts automatically
- Can be friended
- Have unique personalities and life stories
- Tell jokes and interact naturally

## 💳 Subscription Tiers

| Tier | Price | Ad Credits | AI Credits | Features |
|------|-------|------------|------------|----------|
| 1 | $4.99 | 50/month | 100/month | Basic |
| 2 | $9.99 | 150/month | 300/month | Enhanced |
| 3 | $19.99 | 400/month | 750/month | Pro |
| 4 | $49.99 | 1200/month | 2000/month | Premium |
| 5 | $99.99 | Unlimited | Unlimited | Ultimate |

## 🏆 Badge System

- **Founder Badge** - Auto-granted to admin emails
- **Org Verified Badge** - Auto-granted for Roblox verified, 2k+ Twitch followers, 3k+ TikTok followers
- **Founding Group Member Badge** - Auto-granted to group members
- **Custom Creator Badges** - Groups and creators can create their own

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/discord` - Discord OAuth
- `GET /api/auth/discord/callback` - Discord callback
- `GET /api/auth/roblox` - Roblox OAuth
- `GET /api/auth/roblox/callback` - Roblox callback

### Posts
- `GET /api/posts` - Get feed
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like post
- `POST /api/posts/:id/comment` - Comment on post

### AI Avatars
- `POST /api/ai/:avatarName/chat` - Chat with AI avatar
- `GET /api/ai/:avatarName/status` - Get avatar status
- `GET /api/ai/:avatarName/history` - Get chat history

### Admin Panel
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Manage users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/settings` - Update settings
- `POST /api/admin/badges/create` - Create badge
- `PUT /api/admin/api-keys` - Update API keys

## 🔒 SSL Configuration (Production)

For Apollo Panel / SparkedHost hosting:

1. Generate or upload SSL certificates
2. Set environment variables:
```bash
SSL_KEY=/path/to/private.key
SSL_CERT=/path/to/certificate.crt
NODE_ENV=production
```

The server automatically detects SSL configuration and starts HTTPS in production mode.

## 🤝 Discord Bot Integration

The backend integrates with the Game Killer's Security™ Discord bot:

- Linked via API for moderation
- Shared security monitoring
- Auto-moderation features
- Welcome system integration

## ⚙️ Background Workers

Automated cron jobs run in the background:

- **AI Learning** - Every 6 hours
- **Subscription Checks** - Daily at midnight
- **Badge Verification** - Every 12 hours
- **Movie Night Cleanup** - Every 2 hours

## 🌐 Deployment

**Development:**
```bash
npm run dev
```

**Production (Apollo Panel/SparkedHost):**
```bash
NODE_ENV=production npm start
```

Server runs on port **25808**

Production URL: **https://www.gamekillersstudiosbot.com**

## 📝 Environment Variables

See `.env` file for complete list of required environment variables including:
- Server configuration
- SSL certificates
- JWT secrets
- Discord/Roblox OAuth
- PayPal credentials
- AI API keys
- Feature flags

## 🛡️ Security Features

- JWT authentication with refresh tokens
- bcrypt password hashing
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation
- XSS protection

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Support

For issues or questions:
- Discord: https://discord.gg/jR8tcWF
- Website: https://www.gamekillersstudiosbot.com

---

**Built with ❤️ by Game Killers Studio**