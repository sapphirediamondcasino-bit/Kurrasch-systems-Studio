/**
 * Logger Service
 * Custom logging system for the bot
 */

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDirectory = path.join(__dirname, '../../logs');
        this.logFile = path.join(this.logDirectory, `bot-${this.getDateString()}.log`);
        
        // Create logs directory if it doesn't exist
        if (!fs.existsSync(this.logDirectory)) {
            fs.mkdirSync(this.logDirectory, { recursive: true });
        }
    }

    /**
     * Get current date string for log file naming
     */
    getDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Get timestamp string
     */
    getTimestamp() {
        const now = new Date();
        return now.toISOString();
    }

    /**
     * Format log message
     */
    formatMessage(level, message, data = null) {
        const timestamp = this.getTimestamp();
        let logMessage = `[${timestamp}] [${level}] ${message}`;
        
        if (data) {
            logMessage += `\n${JSON.stringify(data, null, 2)}`;
        }
        
        return logMessage;
    }

    /**
     * Write to log file
     */
    writeToFile(message) {
        try {
            fs.appendFileSync(this.logFile, message + '\n', 'utf8');
        } catch (error) {
            console.error(chalk.red('Failed to write to log file:'), error);
        }
    }

    /**
     * Info log
     */
    info(message, data = null) {
        const formattedMessage = this.formatMessage('INFO', message, data);
        console.log(chalk.cyan('ℹ️  ' + message));
        if (data) console.log(chalk.gray(JSON.stringify(data, null, 2)));
        this.writeToFile(formattedMessage);
    }

    /**
     * Success log
     */
    success(message, data = null) {
        const formattedMessage = this.formatMessage('SUCCESS', message, data);
        console.log(chalk.green('✅ ' + message));
        if (data) console.log(chalk.gray(JSON.stringify(data, null, 2)));
        this.writeToFile(formattedMessage);
    }

    /**
     * Warning log
     */
    warn(message, data = null) {
        const formattedMessage = this.formatMessage('WARNING', message, data);
        console.log(chalk.yellow('⚠️  ' + message));
        if (data) console.log(chalk.gray(JSON.stringify(data, null, 2)));
        this.writeToFile(formattedMessage);
    }

    /**
     * Error log
     */
    error(message, error = null, data = null) {
        const errorData = error ? {
            message: error.message,
            stack: error.stack,
            ...data
        } : data;
        
        const formattedMessage = this.formatMessage('ERROR', message, errorData);
        console.error(chalk.red('❌ ' + message));
        
        if (error) {
            console.error(chalk.red(error.stack));
        }
        
        if (data) {
            console.log(chalk.gray(JSON.stringify(data, null, 2)));
        }
        
        this.writeToFile(formattedMessage);
    }

    /**
     * Debug log (only in development)
     */
    debug(message, data = null) {
        if (process.env.NODE_ENV === 'development') {
            const formattedMessage = this.formatMessage('DEBUG', message, data);
            console.log(chalk.magenta('🔍 ' + message));
            if (data) console.log(chalk.gray(JSON.stringify(data, null, 2)));
            this.writeToFile(formattedMessage);
        }
    }

    /**
     * Command log
     */
    command(user, commandName, guildName) {
        const message = `Command: /${commandName} | User: ${user} | Guild: ${guildName}`;
        const formattedMessage = this.formatMessage('COMMAND', message);
        console.log(chalk.blue('⚡ ' + message));
        this.writeToFile(formattedMessage);
    }

    /**
     * Moderation action log
     */
    moderation(action, moderator, target, reason, guildName) {
        const message = `Moderation: ${action} | Moderator: ${moderator} | Target: ${target} | Reason: ${reason} | Guild: ${guildName}`;
        const formattedMessage = this.formatMessage('MODERATION', message);
        console.log(chalk.yellow('🔨 ' + message));
        this.writeToFile(formattedMessage);
    }

    /**
     * Security event log
     */
    security(event, details, guildName) {
        const message = `Security: ${event} | Guild: ${guildName}`;
        const formattedMessage = this.formatMessage('SECURITY', message, details);
        console.log(chalk.red('🔒 ' + message));
        if (details) console.log(chalk.gray(JSON.stringify(details, null, 2)));
        this.writeToFile(formattedMessage);
    }

    /**
     * Auto-mod action log
     */
    automod(action, user, violation, guildName) {
        const message = `AutoMod: ${action} | User: ${user} | Violation: ${violation} | Guild: ${guildName}`;
        const formattedMessage = this.formatMessage('AUTOMOD', message);
        console.log(chalk.yellow('🤖 ' + message));
        this.writeToFile(formattedMessage);
    }

    /**
     * Database operation log
     */
    database(operation, collection, details = null) {
        const message = `Database: ${operation} | Collection: ${collection}`;
        const formattedMessage = this.formatMessage('DATABASE', message, details);
        
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk.cyan('💾 ' + message));
            if (details) console.log(chalk.gray(JSON.stringify(details, null, 2)));
        }
        
        this.writeToFile(formattedMessage);
    }

    /**
     * Guild join/leave log
     */
    guild(action, guildName, guildId, memberCount) {
        const message = `Guild ${action}: ${guildName} (${guildId}) | Members: ${memberCount}`;
        const formattedMessage = this.formatMessage('GUILD', message);
        
        const color = action === 'joined' ? chalk.green : chalk.red;
        const emoji = action === 'joined' ? '✅' : '❌';
        
        console.log(color(`${emoji} ${message}`));
        this.writeToFile(formattedMessage);
    }

    /**
     * API call log
     */
    api(service, endpoint, status, responseTime = null) {
        const message = `API: ${service} | Endpoint: ${endpoint} | Status: ${status}${responseTime ? ` | Time: ${responseTime}ms` : ''}`;
        const formattedMessage = this.formatMessage('API', message);
        
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk.cyan('🌐 ' + message));
        }
        
        this.writeToFile(formattedMessage);
    }

    /**
     * Performance log
     */
    performance(operation, duration, details = null) {
        const message = `Performance: ${operation} completed in ${duration}ms`;
        const formattedMessage = this.formatMessage('PERFORMANCE', message, details);
        
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk.magenta('⚡ ' + message));
            if (details) console.log(chalk.gray(JSON.stringify(details, null, 2)));
        }
        
        this.writeToFile(formattedMessage);
    }

    /**
     * System log (startup, shutdown, etc.)
     */
    system(message, data = null) {
        const formattedMessage = this.formatMessage('SYSTEM', message, data);
        console.log(chalk.cyan('🖥️  ' + message));
        if (data) console.log(chalk.gray(JSON.stringify(data, null, 2)));
        this.writeToFile(formattedMessage);
    }

    /**
     * Separator for visual clarity
     */
    separator() {
        const line = '━'.repeat(50);
        console.log(chalk.gray(line));
        this.writeToFile(line);
    }

    /**
     * Clean old log files (keep last 30 days)
     */
    cleanOldLogs() {
        try {
            const files = fs.readdirSync(this.logDirectory);
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

            for (const file of files) {
                const filePath = path.join(this.logDirectory, file);
                const stats = fs.statSync(filePath);

                if (stats.mtimeMs < thirtyDaysAgo) {
                    fs.unlinkSync(filePath);
                    this.info(`Deleted old log file: ${file}`);
                }
            }
        } catch (error) {
            this.error('Failed to clean old logs', error);
        }
    }

    /**
     * Get log file path
     */
    getLogFilePath() {
        return this.logFile;
    }

    /**
     * Get all log files
     */
    getLogFiles() {
        try {
            const files = fs.readdirSync(this.logDirectory);
            return files.filter(file => file.endsWith('.log'));
        } catch (error) {
            this.error('Failed to get log files', error);
            return [];
        }
    }

    /**
     * Read log file
     */
    readLogFile(filename) {
        try {
            const filePath = path.join(this.logDirectory, filename);
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            this.error('Failed to read log file', error);
            return null;
        }
    }

    /**
     * Export logs as JSON
     */
    exportLogsAsJSON(filename) {
        try {
            const logContent = this.readLogFile(filename);
            if (!logContent) return null;

            const lines = logContent.split('\n').filter(line => line.trim());
            const logs = [];

            for (const line of lines) {
                const match = line.match(/\[(.*?)\] \[(.*?)\] (.*)/);
                if (match) {
                    logs.push({
                        timestamp: match[1],
                        level: match[2],
                        message: match[3]
                    });
                }
            }

            return logs;
        } catch (error) {
            this.error('Failed to export logs as JSON', error);
            return null;
        }
    }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;