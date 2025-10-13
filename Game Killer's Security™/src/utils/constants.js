/**
 * Constants and configuration values for Game Killer's Security
 */

module.exports = {
    // Bot Information
    BOT_NAME: 'Game Killer\'s Security™',
    BOT_VERSION: '2.0.0',
    BOT_COLOR: '#00d9ff',

    // Emojis
    EMOJIS: {
        // Status
        SUCCESS: '✅',
        ERROR: '❌',
        WARNING: '⚠️',
        INFO: 'ℹ️',
        LOADING: '⏳',

        // Actions
        BAN: '🔨',
        KICK: '👢',
        WARN: '⚠️',
        TIMEOUT: '⏰',
        PURGE: '🗑️',
        REPORT: '🚨',

        // Security
        SHIELD: '🛡️',
        LOCK: '🔒',
        KEY: '🔑',
        SECURITY: '🔐',
        FLAG: '🚩',

        // Status Indicators
        ONLINE: '🟢',
        IDLE: '🟡',
        DND: '🔴',
        OFFLINE: '⚫',

        // Misc
        SETTINGS: '⚙️',
        DASHBOARD: '📊',
        LOG: '📋',
        SEARCH: '🔍',
        USER: '👤',
        MOD: '👮',
        ADMIN: '👑',
        BOT: '🤖',
        DIAMOND: '💎',
        STAR: '⭐',
        ARROW_UP: '⬆️',
        ARROW_DOWN: '⬇️',
        CHECK: '✔️',
        CROSS: '✖️',
        REFRESH: '🔄',
        EXPORT: '📥',
        IMPORT: '📤'
    },

    // Colors
    COLORS: {
        SUCCESS: '#00ff00',
        ERROR: '#ff0000',
        WARNING: '#ffff00',
        INFO: '#00d9ff',
        NEUTRAL: '#808080',
        BAN: '#ff0000',
        KICK: '#ff9900',
        WARN: '#ffff00',
        TIMEOUT: '#ffa500',
        PURGE: '#00ff00',
        SECURITY: '#ff0000',
        DASHBOARD: '#00d9ff',
        PRO: '#9b59b6',
        ENTERPRISE: '#ff6600'
    },

    // Risk Levels
    RISK_LEVELS: {
        LOW: {
            name: 'Low Risk',
            emoji: '🟢',
            color: '#00ff00',
            threshold: 0
        },
        MEDIUM: {
            name: 'Medium Risk',
            emoji: '🟡',
            color: '#ffff00',
            threshold: 2
        },
        HIGH: {
            name: 'High Risk',
            emoji: '🔴',
            color: '#ff0000',
            threshold: 5
        }
    },

    // Subscription Tiers
    TIERS: {
        FREE: {
            name: 'Free',
            price: '$0',
            features: [
                'Basic moderation commands',
                'User warnings & reports',
                'Basic dashboard',
                'Up to 5 security logs',
                'Community support'
            ],
            limits: {
                maxWarnings: 50,
                maxReports: 100,
                maxLogs: 500
            }
        },
        BASIC: {
            name: 'Basic',
            price: '$4.99/month',
            features: [
                'All Free features',
                'Advanced moderation tools',
                'Custom auto-mod rules',
                'Extended log history',
                'Email support'
            ],
            limits: {
                maxWarnings: 500,
                maxReports: 1000,
                maxLogs: 5000
            }
        },
        PRO: {
            name: 'Pro',
            price: '$9.99/month',
            features: [
                'All Basic features',
                'Pro Dashboard with analytics',
                'AI threat detection',
                'Roblox ban syncing',
                'Custom security alerts',
                'Export logs & reports',
                'Priority support'
            ],
            limits: {
                maxWarnings: -1, // Unlimited
                maxReports: -1,
                maxLogs: -1
            }
        },
        ENTERPRISE: {
            name: 'Enterprise',
            price: 'Contact us',
            features: [
                'All Pro features',
                'Multi-server management',
                'Custom integrations',
                'Dedicated account manager',
                '24/7 priority support',
                'Custom AI training',
                'SLA guarantee'
            ],
            limits: {
                maxWarnings: -1,
                maxReports: -1,
                maxLogs: -1
            }
        }
    },

    // Security Levels
    SECURITY_LEVELS: {
        LOW: {
            name: 'Low',
            description: 'Minimal security checks',
            autoMod: false,
            antiSpam: false,
            antiRaid: false
        },
        MEDIUM: {
            name: 'Medium',
            description: 'Standard security measures',
            autoMod: true,
            antiSpam: true,
            antiRaid: false
        },
        HIGH: {
            name: 'High',
            description: 'Enhanced security protocols',
            autoMod: true,
            antiSpam: true,
            antiRaid: true
        },
        MAXIMUM: {
            name: 'Maximum',
            description: 'Maximum security lockdown',
            autoMod: true,
            antiSpam: true,
            antiRaid: true,
            strictMode: true
        }
    },

    // Time Constants (in milliseconds)
    TIME: {
        SECOND: 1000,
        MINUTE: 60 * 1000,
        HOUR: 60 * 60 * 1000,
        DAY: 24 * 60 * 60 * 1000,
        WEEK: 7 * 24 * 60 * 60 * 1000,
        MONTH: 30 * 24 * 60 * 60 * 1000
    },

    // Moderation Limits
    MODERATION: {
        MAX_WARNINGS_DEFAULT: 3,
        MAX_TIMEOUT_MINUTES: 40320, // 28 days
        MAX_PURGE_MESSAGES: 100,
        DEFAULT_TIMEOUT_DURATION: 60, // minutes
        WARNING_EXPIRY_DAYS: 30
    },

    // Auto-Moderation Thresholds
    AUTO_MOD: {
        SPAM_MESSAGE_COUNT: 5,
        SPAM_TIME_WINDOW: 5000, // 5 seconds
        MAX_MENTIONS: 5,
        MAX_LINKS: 3,
        MAX_EMOJIS: 10,
        CAPS_PERCENTAGE: 70,
        REPEAT_THRESHOLD: 3
    },

    // Report Status
    REPORT_STATUS: {
        PENDING: 'pending',
        APPROVED: 'approved',
        DENIED: 'denied',
        INVESTIGATING: 'investigating'
    },

    // Log Types
    LOG_TYPES: {
        SECURITY: 'security',
        MODERATION: 'moderation',
        SYSTEM: 'system',
        USER: 'user',
        COMMAND: 'command'
    },

    // Error Messages
    ERRORS: {
        NO_PERMISSION: 'You do not have permission to use this command.',
        BOT_NO_PERMISSION: 'I do not have permission to perform this action.',
        USER_NOT_FOUND: 'User not found in this server.',
        INVALID_USER: 'Please provide a valid user.',
        CANNOT_MODERATE: 'I cannot moderate this user (higher role or permissions).',
        SELF_MODERATE: 'You cannot moderate yourself.',
        BOT_MODERATE: 'You cannot moderate bots.',
        DATABASE_ERROR: 'Database error occurred. Please try again.',
        COMMAND_ERROR: 'An error occurred while executing this command.',
        TIER_REQUIRED: 'This feature requires a higher subscription tier.',
        COOLDOWN: 'Please wait before using this command again.'
    },

    // Success Messages
    SUCCESS: {
        BAN: 'User has been banned successfully.',
        KICK: 'User has been kicked successfully.',
        WARN: 'User has been warned successfully.',
        TIMEOUT: 'User has been timed out successfully.',
        PURGE: 'Messages have been deleted successfully.',
        REPORT_SUBMITTED: 'Report has been submitted to the moderation team.',
        SETTINGS_SAVED: 'Settings have been saved successfully.'
    },

    // Default Settings
    DEFAULT_SETTINGS: {
        autoMod: false,
        securityLevel: 'Medium',
        logChannel: null,
        reportChannel: null,
        welcomeChannel: null,
        antiSpam: true,
        antiRaid: false,
        linkFilter: false,
        wordFilter: false,
        maxWarnings: 3,
        autoTimeout: false,
        timeoutDuration: 60,
        welcomeMessage: null,
        autoRole: null
    },

    // Regex Patterns
    PATTERNS: {
        URL: /(https?:\/\/[^\s]+)/gi,
        DISCORD_INVITE: /(discord\.gg|discord\.com\/invite)\/[a-zA-Z0-9]+/gi,
        EMAIL: /[\w.-]+@[\w.-]+\.\w+/gi,
        IP_ADDRESS: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/gi,
        MENTION: /<@!?(\d+)>/g,
        EMOJI: /<a?:\w+:\d+>/g
    },

    // Links
    LINKS: {
        SUPPORT_SERVER: 'https://discord.gg/your-support-server',
        DOCUMENTATION: 'https://docs.example.com',
        PRIVACY_POLICY: 'https://example.com/privacy',
        TERMS_OF_SERVICE: 'https://example.com/terms'
    }
};