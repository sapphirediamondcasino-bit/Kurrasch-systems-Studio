# Game Killers Studio Backend - Complete Structure

## Directory Structure
```
backend/
├── server.js
├── package.json
├── .env
├── .gitignore
├── README.md
├── datastore/
│   ├── users.json
│   ├── posts.json
│   ├── friends.json
│   ├── followers.json
│   ├── subscriptions.json
│   ├── badges.json
│   ├── games.json
│   ├── conversions.json
│   ├── aiLogs.json
│   ├── movieNights.json
│   ├── teamBuilder.json
│   ├── buildBattles.json
│   ├── ideaVault.json
│   ├── projectHub.json
│   ├── goalTracker.json
│   ├── miniArcade.json
│   ├── marketplace.json
│   ├── notifications.json
│   └── xpLeaderboard.json
├── routes/
│   ├── auth.js
│   ├── posts.js
│   ├── users.js
│   ├── ai.js
│   ├── subscriptions.js
│   ├── badges.js
│   ├── games.js
│   ├── movieNight.js
│   ├── admin.js
│   ├── teamBuilder.js
│   ├── buildBattles.js
│   ├── ideaVault.js
│   ├── projectHub.js
│   ├── goalTracker.js
│   ├── miniArcade.js
│   ├── marketplace.js
│   ├── notifications.js
│   ├── xp.js
│   ├── friends.js
│   └── followers.js
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── upload.js
├── utils/
│   ├── datastore.js
│   ├── jwt.js
│   ├── xp.js
│   ├── notifications.js
│   ├── paypal.js
│   ├── roblox.js
│   ├── discord.js
│   ├── aiWorker.js
│   ├── subscriptionWorker.js
│   ├── badgeWorker.js
│   └── movieNightWorker.js
├── ai/
│   ├── bettyWhite.js
│   ├── robinWilliams.js
│   ├── johnnyHardwick.js
│   ├── jonathanJoss.js
│   └── dianeKeaton.js
├── scripts/
│   └── init.js
└── uploads/
    ├── avatars/
    ├── posts/
    └── games/
```

## Installation Steps

1. **Initialize Backend:**
```bash
cd backend
npm install
```

2. **Configure .env file** with all credentials

3. **Initialize Datastore:**
```bash
npm run init
```

4. **Start Server:**
```bash
# Development
npm run dev

# Production
npm start
```

## Admin Accounts Auto-Created
- gamekillerszone@gmail.com (Group Admin - Founder Badge, Org Badge, Tier 5)
- tannerkurrach@gmail.com (Creator Admin - Founder Badge, Org Badge, Tier 5)

## API Endpoints Summary

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/discord (OAuth)
- GET /api/auth/discord/callback
- GET /api/auth/roblox (OAuth)
- GET /api/auth/roblox/callback
- POST /api/auth/refresh

### Users
- GET /api/users/:id
- PUT /api/users/:id
- GET /api/users/:id/profile
- GET /api/users/search

### Posts
- GET /api/posts (feed)
- GET /api/posts/:id
- POST /api/posts
- PUT /api/posts/:id
- DELETE /api/posts/:id
- POST /api/posts/:id/like
- POST /api/posts/:id/comment

### AI Mini Avatars
- POST /api/ai/bettywhite/chat
- POST /api/ai/robinwilliams/chat
- POST /api/ai/johnnyhardwick/chat
- POST /api/ai/jonathanjoss/chat
- POST /api/ai/dianekeaton/chat
- GET /api/ai/:avatarName/status
- GET /api/ai/:avatarName/history

### Subscriptions
- GET /api/subscriptions/:userId
- POST /api/subscriptions/create
- POST /api/subscriptions/cancel
- POST /api/subscriptions/webhook
- POST /api/subscriptions/buy-credits

### Badges
- GET /api/badges/:userId
- POST /api/badges/verify
- POST /api/badges/create (admin)

### Games
- GET /api/games
- GET /api/games/:id
- POST /api/games (creator)
- PUT /api/games/:id
- DELETE /api/games/:id

### Movie Night
- GET /api/movienight
- GET /api/movienight/:id
- POST /api/movienight/create
- PUT /api/movienight/:id
- DELETE /api/movienight/:id
- POST /api/movienight/:id/join
- GET /api/movienight/:id/chat

### Admin Panel
- GET /api/admin/stats
- GET /api/admin/users
- PUT /api/admin/users/:id
- DELETE /api/admin/users/:id
- GET /api/admin/posts
- DELETE /api/admin/posts/:id
- PUT /api/admin/settings
- POST /api/admin/badges/create
- GET /api/admin/subscriptions
- PUT /api/admin/api-keys

### Team Builder, Build Battles, etc.
- Full CRUD operations for all community features
- Moderation endpoints
- Safety filtering

## Subscription Tiers

| Tier | Price | Ad Credits | AI Credits | Features |
|------|-------|------------|------------|----------|
| 1 | $4.99 | 50/month | 100/month | Basic |
| 2 | $9.99 | 150/month | 300/month | Enhanced |
| 3 | $19.99 | 400/month | 750/month | Pro |
| 4 | $49.99 | 1200/month | 2000/month | Premium |
| 5 | $99.99 | Unlimited | Unlimited | Ultimate |

## Badge Types
- Founder (Auto: Admin emails)
- Org Verified (Auto: Roblox verified, 2k+ Twitch, 3k+ TikTok)
- Founding Group Member (Auto: Group members)
- Custom Creator Badges

## AI Avatars
- Betty White (Comedian, Actress)
- Robin Williams (Comedian, Actor)
- Johnny Hardwick (Voice of Dale Gribble)
- Jonathan Joss (Voice of John Redcorn)
- Diane Keaton (Actress)
- Shelley Duvall (Actress)
- Michelle Trachtenberg (Actress)
- James Earl Jones (Actress)
- Matthew Perry (Comedian, Actor)
- John Candy (Comedian, Actor)
- Chris Farley (Comedian, Actor)
- Harold Ramis (Actor)

Each has:
- Unique personality
- Life stories
- Joke database
- Interactive chat
- Avatar appearance

## SSL Setup (Apollo Panel/SparkedHost)

1. Generate/Upload SSL certificates
2. Set environment variables:
```
SSL_KEY=/path/to/private.key
SSL_CERT=/path/to/certificate.crt
```
3. Server auto-detects and uses HTTPS in production

## Security Features
- JWT authentication
- bcrypt password hashing
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- XSS protection
- SQL injection prevention (N/A - JSON datastore)

## Background Workers (Cron Jobs)
- AI Learning: Every 6 hours
- Subscription Checks: Daily at midnight
- Badge Verification: Every 12 hours
- Movie Night Cleanup: Every 2 hours



Kurrasch systems Studio/
    backend/
    frontend/
        .env
        .gitignore
        README.md
        components.json
        craco.config.js
        jsconfig.json
        package.json
        postcss.config.js
        public/
            index.html
        src/
            App.css
            App.js
            index.css
            index.js
            components/
                Avatar.jsx
                ChatBody.jsx
                ChatHeader.jsx
                ChatMessage.jsx
                ChatUserList.jsx
                Comment.jsx
                CreatePost.jsx
                Editor.jsx
                FeedItem.jsx
                Footer.jsx
                Header.jsx
                LeftSidebar.jsx
                RightSidebar.jsx
                ChatBox.jsx
                RightSidebar.jsx
                components/
                    ui/
                        accordion.jsx
                        alert.jsx
                        aspect-ratio.jsx
                        avatar.jsx
                        badge.jsx
                        button.jsx
                        card.jsx
                        carousel.jsx
                        checkbox.jsx
                        dialog.jsx
                        divider.jsx
                        dropdown-menu.jsx
                        form.jsx
                        input.jsx
                        label.jsx
                        menubar.jsx
                        navigation-menu.jsx
                        pagination.jsx
                        popover.jsx
                        progress.jsx
                        scroll-area.jsx
                        select.jsx
                        separator.jsx
                        sheet.jsx
                        switch.jsx
                        table.jsx
                        textarea.jsx
                        toggle.jsx
                        tooltip.jsx
                        toast.jsx
                ChatBox.jsx
                RightSidebar.jsx
                ChatBox.jsx
                index.js
            pages/
                About.jsx
                AdminDashboard.jsx
                AdminPanel.jsx
                AdminSettings.jsx
                Announcements.jsx
                BuildBattle.jsx
                Dashboard.jsx
                DevHub.jsx
                Discover.jsx
                Games.jsx
                Home.jsx
                Login.jsx
                MovieSession.jsx
                Movies.jsx
                PostDetail.jsx
                Privacy.jsx
                Profile.jsx
                Signup.jsx
                Terms.jsx
        tailwind.config.js
        yarn.lock





