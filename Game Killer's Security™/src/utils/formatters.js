/**
 * Formatters Utility
 * Time, number, and text formatting functions
 */

class Formatters {
    /**
     * Format milliseconds to human readable time
     */
    static formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Format duration in minutes to readable format
     */
    static formatDuration(minutes) {
        if (minutes >= 1440) {
            const days = Math.floor(minutes / 1440);
            const remainingHours = Math.floor((minutes % 1440) / 60);
            return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
        } else if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
        } else {
            return `${minutes}m`;
        }
    }

    /**
     * Format timestamp to Discord timestamp format
     */
    static formatDiscordTimestamp(date, style = 'f') {
        const timestamp = Math.floor(date.getTime() / 1000);
        return `<t:${timestamp}:${style}>`;
    }

    /**
     * Format relative time (e.g., "5 minutes ago")
     */
    static formatRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (years > 0) {
            return years === 1 ? '1 year ago' : `${years} years ago`;
        } else if (months > 0) {
            return months === 1 ? '1 month ago' : `${months} months ago`;
        } else if (weeks > 0) {
            return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
        } else if (days > 0) {
            return days === 1 ? '1 day ago' : `${days} days ago`;
        } else if (hours > 0) {
            return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
        } else if (minutes > 0) {
            return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
        } else if (seconds > 0) {
            return seconds === 1 ? '1 second ago' : `${seconds} seconds ago`;
        } else {
            return 'just now';
        }
    }

    /**
     * Format number with commas
     */
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Format large numbers (1K, 1M, etc.)
     */
    static formatCompactNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        } else {
            return num.toString();
        }
    }

    /**
     * Format percentage
     */
    static formatPercentage(value, total, decimals = 1) {
        if (total === 0) return '0%';
        const percentage = (value / total) * 100;
        return `${percentage.toFixed(decimals)}%`;
    }

    /**
     * Format bytes to human readable size
     */
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Truncate text with ellipsis
     */
    static truncate(text, maxLength, suffix = '...') {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    /**
     * Capitalize first letter
     */
    static capitalize(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    /**
     * Capitalize each word
     */
    static capitalizeWords(text) {
        if (!text) return '';
        return text.split(' ').map(word => this.capitalize(word)).join(' ');
    }

    /**
     * Format user tag
     */
    static formatUserTag(user) {
        return `${user.username}#${user.discriminator}`;
    }

    /**
     * Format user mention
     */
    static formatUserMention(userId) {
        return `<@${userId}>`;
    }

    /**
     * Format role mention
     */
    static formatRoleMention(roleId) {
        return `<@&${roleId}>`;
    }

    /**
     * Format channel mention
     */
    static formatChannelMention(channelId) {
        return `<#${channelId}>`;
    }

    /**
     * Format list with proper grammar
     */
    static formatList(items, conjunction = 'and') {
        if (items.length === 0) return '';
        if (items.length === 1) return items[0];
        if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
        
        const lastItem = items[items.length - 1];
        const otherItems = items.slice(0, -1);
        return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
    }

    /**
     * Format boolean to Yes/No
     */
    static formatBoolean(value) {
        return value ? '✅ Yes' : '❌ No';
    }

    /**
     * Format date to readable string
     */
    static formatDate(date, includeTime = true) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }

        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Format ISO date string
     */
    static formatISODate(isoString) {
        const date = new Date(isoString);
        return this.formatDate(date);
    }

    /**
     * Parse duration string to minutes (e.g., "1h 30m" -> 90)
     */
    static parseDuration(durationString) {
        const regex = /(\d+)([smhd])/g;
        let totalMinutes = 0;
        let match;

        while ((match = regex.exec(durationString)) !== null) {
            const value = parseInt(match[1]);
            const unit = match[2];

            switch (unit) {
                case 's':
                    totalMinutes += value / 60;
                    break;
                case 'm':
                    totalMinutes += value;
                    break;
                case 'h':
                    totalMinutes += value * 60;
                    break;
                case 'd':
                    totalMinutes += value * 1440;
                    break;
            }
        }

        return Math.floor(totalMinutes);
    }

    /**
     * Format uptime
     */
    static formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const parts = [];
        
        if (days > 0) parts.push(`${days}d`);
        if (hours % 24 > 0) parts.push(`${hours % 24}h`);
        if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
        if (seconds % 60 > 0) parts.push(`${seconds % 60}s`);

        return parts.join(' ') || '0s';
    }

    /**
     * Format ordinal number (1st, 2nd, 3rd, etc.)
     */
    static formatOrdinal(num) {
        const j = num % 10;
        const k = num % 100;
        
        if (j === 1 && k !== 11) {
            return num + 'st';
        }
        if (j === 2 && k !== 12) {
            return num + 'nd';
        }
        if (j === 3 && k !== 13) {
            return num + 'rd';
        }
        return num + 'th';
    }

    /**
     * Format progress bar
     */
    static formatProgressBar(current, total, length = 10, fillChar = '█', emptyChar = '░') {
        const percentage = current / total;
        const filled = Math.floor(percentage * length);
        const empty = length - filled;
        
        const bar = fillChar.repeat(filled) + emptyChar.repeat(empty);
        const percent = this.formatPercentage(current, total, 0);
        
        return `${bar} ${percent}`;
    }

    /**
     * Format code block
     */
    static formatCodeBlock(code, language = '') {
        return `\`\`\`${language}\n${code}\n\`\`\``;
    }

    /**
     * Format inline code
     */
    static formatInlineCode(text) {
        return `\`${text}\``;
    }

    /**
     * Format bold text
     */
    static formatBold(text) {
        return `**${text}**`;
    }

    /**
     * Format italic text
     */
    static formatItalic(text) {
        return `*${text}*`;
    }

    /**
     * Format underline text
     */
    static formatUnderline(text) {
        return `__${text}__`;
    }

    /**
     * Format strikethrough text
     */
    static formatStrikethrough(text) {
        return `~~${text}~~`;
    }

    /**
     * Format spoiler text
     */
    static formatSpoiler(text) {
        return `||${text}||`;
    }

    /**
     * Format quote
     */
    static formatQuote(text) {
        return `> ${text}`;
    }

    /**
     * Format block quote
     */
    static formatBlockQuote(text) {
        return `>>> ${text}`;
    }

    /**
     * Clean and sanitize text
     */
    static sanitize(text) {
        return text
            .replace(/[`*_~|]/g, '\\$&') // Escape markdown
            .replace(/@(everyone|here)/g, '@\u200b$1'); // Prevent mass mentions
    }

    /**
     * Format array to numbered list
     */
    static formatNumberedList(items) {
        return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
    }

    /**
     * Format array to bullet list
     */
    static formatBulletList(items, bullet = '•') {
        return items.map(item => `${bullet} ${item}`).join('\n');
    }

    /**
     * Format object to key-value pairs
     */
    static formatKeyValue(obj, separator = ': ') {
        return Object.entries(obj)
            .map(([key, value]) => `${this.capitalize(key)}${separator}${value}`)
            .join('\n');
    }

    /**
     * Format table (simple ASCII table)
     */
    static formatTable(headers, rows) {
        const columnWidths = headers.map((header, i) => {
            const maxRowWidth = Math.max(...rows.map(row => String(row[i] || '').length));
            return Math.max(header.length, maxRowWidth);
        });

        const formatRow = (row) => {
            return row.map((cell, i) => String(cell || '').padEnd(columnWidths[i])).join(' | ');
        };

        const headerRow = formatRow(headers);
        const separator = columnWidths.map(width => '-'.repeat(width)).join('-+-');
        const dataRows = rows.map(formatRow).join('\n');

        return `${headerRow}\n${separator}\n${dataRows}`;
    }

    /**
     * Format JSON with indentation
     */
    static formatJSON(obj, indent = 2) {
        return JSON.stringify(obj, null, indent);
    }

    /**
     * Remove markdown formatting
     */
    static stripMarkdown(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
            .replace(/\*(.+?)\*/g, '$1') // Italic
            .replace(/__(.+?)__/g, '$1') // Underline
            .replace(/~~(.+?)~~/g, '$1') // Strikethrough
            .replace(/\|\|(.+?)\|\|/g, '$1') // Spoiler
            .replace(/`(.+?)`/g, '$1') // Code
            .replace(/```[\s\S]+?```/g, '') // Code blocks
            .replace(/> (.+)/g, '$1') // Quotes
            .replace(/>>> (.+)/g, '$1'); // Block quotes
    }
}

module.exports = Formatters;