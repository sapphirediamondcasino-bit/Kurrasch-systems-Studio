const { PermissionFlagsBits } = require('discord.js');

/**
 * Permission checking utilities for Game Killer's Security
 */

module.exports = {
    /**
     * Check if user has moderator permissions
     */
    isModerator(member) {
        return member.permissions.has(PermissionFlagsBits.ModerateMembers) ||
               member.permissions.has(PermissionFlagsBits.KickMembers) ||
               member.permissions.has(PermissionFlagsBits.BanMembers);
    },

    /**
     * Check if user has administrator permissions
     */
    isAdmin(member) {
        return member.permissions.has(PermissionFlagsBits.Administrator);
    },

    /**
     * Check if user is server owner
     */
    isOwner(member) {
        return member.guild.ownerId === member.id;
    },

    /**
     * Check if bot can ban members
     */
    canBan(guild) {
        const botMember = guild.members.me;
        return botMember.permissions.has(PermissionFlagsBits.BanMembers);
    },

    /**
     * Check if bot can kick members
     */
    canKick(guild) {
        const botMember = guild.members.me;
        return botMember.permissions.has(PermissionFlagsBits.KickMembers);
    },

    /**
     * Check if bot can timeout members
     */
    canTimeout(guild) {
        const botMember = guild.members.me;
        return botMember.permissions.has(PermissionFlagsBits.ModerateMembers);
    },

    /**
     * Check if bot can delete messages
     */
    canDeleteMessages(guild) {
        const botMember = guild.members.me;
        return botMember.permissions.has(PermissionFlagsBits.ManageMessages);
    },

    /**
     * Check if bot can manage roles
     */
    canManageRoles(guild) {
        const botMember = guild.members.me;
        return botMember.permissions.has(PermissionFlagsBits.ManageRoles);
    },

    /**
     * Check if target member can be moderated by the bot
     */
    canModerate(guild, targetMember) {
        const botMember = guild.members.me;
        
        // Can't moderate the owner
        if (targetMember.id === guild.ownerId) {
            return false;
        }

        // Can't moderate members with higher or equal role hierarchy
        if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
            return false;
        }

        return true;
    },

    /**
     * Check if member can be moderated by another member
     */
    canModerateTarget(moderator, target) {
        // Owner can moderate anyone
        if (moderator.id === moderator.guild.ownerId) {
            return true;
        }

        // Can't moderate yourself
        if (moderator.id === target.id) {
            return false;
        }

        // Can't moderate the owner
        if (target.id === target.guild.ownerId) {
            return false;
        }

        // Can't moderate members with higher or equal role hierarchy
        if (target.roles.highest.position >= moderator.roles.highest.position) {
            return false;
        }

        return true;
    },

    /**
     * Check if bot has all required permissions
     */
    hasRequiredPermissions(guild) {
        const botMember = guild.members.me;
        const required = [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.ReadMessageHistory
        ];

        return required.every(perm => botMember.permissions.has(perm));
    },

    /**
     * Get missing permissions
     */
    getMissingPermissions(guild, requiredPerms) {
        const botMember = guild.members.me;
        const missing = [];

        for (const perm of requiredPerms) {
            if (!botMember.permissions.has(perm)) {
                missing.push(this.getPermissionName(perm));
            }
        }

        return missing;
    },

    /**
     * Convert permission flag to readable name
     */
    getPermissionName(permission) {
        const names = {
            [PermissionFlagsBits.Administrator]: 'Administrator',
            [PermissionFlagsBits.ManageGuild]: 'Manage Server',
            [PermissionFlagsBits.ManageRoles]: 'Manage Roles',
            [PermissionFlagsBits.ManageChannels]: 'Manage Channels',
            [PermissionFlagsBits.KickMembers]: 'Kick Members',
            [PermissionFlagsBits.BanMembers]: 'Ban Members',
            [PermissionFlagsBits.ModerateMembers]: 'Timeout Members',
            [PermissionFlagsBits.ManageMessages]: 'Manage Messages',
            [PermissionFlagsBits.ViewChannel]: 'View Channels',
            [PermissionFlagsBits.SendMessages]: 'Send Messages',
            [PermissionFlagsBits.EmbedLinks]: 'Embed Links',
            [PermissionFlagsBits.AttachFiles]: 'Attach Files',
            [PermissionFlagsBits.ReadMessageHistory]: 'Read Message History',
            [PermissionFlagsBits.UseExternalEmojis]: 'Use External Emojis'
        };

        return names[permission] || 'Unknown Permission';
    },

    /**
     * Check if user has specific permission
     */
    hasPermission(member, permission) {
        return member.permissions.has(permission);
    },

    /**
     * Check tier-based permissions
     */
    hasTierPermission(serverData, requiredTier) {
        const tiers = ['Free', 'Basic', 'Pro', 'Enterprise'];
        const currentTier = serverData.tier || 'Free';
        
        const currentIndex = tiers.indexOf(currentTier);
        const requiredIndex = tiers.indexOf(requiredTier);

        return currentIndex >= requiredIndex;
    },

    /**
     * Format permissions for display
     */
    formatPermissions(permissions) {
        return permissions.map(perm => `• ${this.getPermissionName(perm)}`).join('\n');
    }
};