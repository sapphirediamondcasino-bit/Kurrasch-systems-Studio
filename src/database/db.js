/**
 * Database Handler
 * Simple JSON-based database system
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class Database {
    constructor() {
        this.dataDir = path.join(__dirname, 'data');
        this.dbPath = path.join(this.dataDir, 'database.json');
        this.data = {
            servers: {},
            users: {},
            version: '2.0.0',
            lastUpdated: new Date().toISOString()
        };
        this.autoSaveInterval = null;
    }

    /**
     * Initialize database
     */
    initialize() {
        try {
            // Create data directory if it doesn't exist
            if (!fs.existsSync(this.dataDir)) {
                fs.mkdirSync(this.dataDir, { recursive: true });
                console.log(chalk.green('✅ Created database directory'));
            }

            // Load existing database or create new one
            if (fs.existsSync(this.dbPath)) {
                this.load();
                console.log(chalk.green('✅ Database loaded successfully'));
            } else {
                this.save();
                console.log(chalk.green('✅ Database initialized'));
            }

            // Setup auto-save
            this.setupAutoSave();

        } catch (error) {
            console.error(chalk.red('❌ Database initialization failed:'), error);
            throw error;
        }
    }

    /**
     * Load database from file
     */
    load() {
        try {
            const rawData = fs.readFileSync(this.dbPath, 'utf8');
            this.data = JSON.parse(rawData);

            // Ensure structure
            if (!this.data.servers) this.data.servers = {};
            if (!this.data.users) this.data.users = {};
            if (!this.data.version) this.data.version = '2.0.0';

            return true;
        } catch (error) {
            console.error(chalk.red('❌ Failed to load database:'), error);
            return false;
        }
    }

    /**
     * Save database to file
     */
    save() {
        try {
            this.data.lastUpdated = new Date().toISOString();
            const jsonData = JSON.stringify(this.data, null, 2);
            fs.writeFileSync(this.dbPath, jsonData, 'utf8');
            return true;
        } catch (error) {
            console.error(chalk.red('❌ Failed to save database:'), error);
            return false;
        }
    }

    /**
     * Setup automatic saving
     */
    setupAutoSave(interval = 60000) {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        this.autoSaveInterval = setInterval(() => {
            this.save();
            console.log(chalk.gray('💾 Auto-saved database'));
        }, interval);
    }

    /**
     * Get server data
     */
    getServer(guildId) {
        return this.data.servers[guildId] || null;
    }

    /**
     * Save server data
     */
    saveServer(guildId, serverData) {
        this.data.servers[guildId] = {
            ...serverData,
            guildId,
            lastUpdated: new Date().toISOString()
        };
        this.save();
        return this.data.servers[guildId];
    }

    /**
     * Delete server data
     */
    deleteServer(guildId) {
        if (this.data.servers[guildId]) {
            delete this.data.servers[guildId];
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Get all servers
     */
    getAllServers() {
        return this.data.servers;
    }

    /**
     * Get user data for a specific guild
     */
    getUser(guildId, userId) {
        const key = `${guildId}_${userId}`;
        return this.data.users[key] || null;
    }

    /**
     * Save user data for a specific guild
     */
    saveUser(guildId, userId, userData) {
        const key = `${guildId}_${userId}`;
        this.data.users[key] = {
            ...userData,
            userId,
            guildId,
            lastUpdated: new Date().toISOString()
        };
        this.save();
        return this.data.users[key];
    }

    /**
     * Delete user data
     */
    deleteUser(guildId, userId) {
        const key = `${guildId}_${userId}`;
        if (this.data.users[key]) {
            delete this.data.users[key];
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Get all users for a specific guild
     */
    getAllUsers(guildId) {
        const users = {};
        
        for (const [key, userData] of Object.entries(this.data.users)) {
            if (key.startsWith(`${guildId}_`)) {
                const userId = key.split('_')[1];
                users[userId] = userData;
            }
        }
        
        return users;
    }

    /**
     * Get all users across all guilds
     */
    getAllUsersGlobal() {
        return this.data.users;
    }

    /**
     * Clear all data for a guild (use with caution!)
     */
    clearGuildData(guildId) {
        // Delete server data
        this.deleteServer(guildId);

        // Delete all user data for this guild
        const usersToDelete = Object.keys(this.data.users).filter(key => 
            key.startsWith(`${guildId}_`)
        );

        for (const key of usersToDelete) {
            delete this.data.users[key];
        }

        this.save();
        return true;
    }

    /**
     * Get database statistics
     */
    getStats() {
        const serverCount = Object.keys(this.data.servers).length;
        const userCount = Object.keys(this.data.users).length;
        
        let totalWarnings = 0;
        let totalBans = 0;
        let totalKicks = 0;
        let totalReports = 0;

        // Count totals from servers
        for (const server of Object.values(this.data.servers)) {
            totalWarnings += server.totalWarnings || 0;
            totalBans += server.totalBans || 0;
            totalKicks += server.totalKicks || 0;
            totalReports += server.totalReports || 0;
        }

        return {
            servers: serverCount,
            users: userCount,
            totalWarnings,
            totalBans,
            totalKicks,
            totalReports,
            version: this.data.version,
            lastUpdated: this.data.lastUpdated
        };
    }

    /**
     * Backup database
     */
    backup() {
        try {
            const backupDir = path.join(this.dataDir, 'backups');
            
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
            const backupPath = path.join(backupDir, `backup_${timestamp}.json`);

            fs.copyFileSync(this.dbPath, backupPath);
            console.log(chalk.green(`✅ Database backed up to: ${backupPath}`));

            return backupPath;
        } catch (error) {
            console.error(chalk.red('❌ Backup failed:'), error);
            return null;
        }
    }

    /**
     * Restore from backup
     */
    restore(backupPath) {
        try {
            if (!fs.existsSync(backupPath)) {
                console.error(chalk.red('❌ Backup file not found'));
                return false;
            }

            fs.copyFileSync(backupPath, this.dbPath);
            this.load();

            console.log(chalk.green('✅ Database restored from backup'));
            return true;
        } catch (error) {
            console.error(chalk.red('❌ Restore failed:'), error);
            return false;
        }
    }

    /**
     * Export data as JSON
     */
    export(filepath) {
        try {
            const exportData = JSON.stringify(this.data, null, 2);
            fs.writeFileSync(filepath, exportData, 'utf8');
            console.log(chalk.green(`✅ Data exported to: ${filepath}`));
            return true;
        } catch (error) {
            console.error(chalk.red('❌ Export failed:'), error);
            return false;
        }
    }

    /**
     * Import data from JSON
     */
    import(filepath) {
        try {
            if (!fs.existsSync(filepath)) {
                console.error(chalk.red('❌ Import file not found'));
                return false;
            }

            const importData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            
            // Merge with existing data
            this.data = {
                ...this.data,
                ...importData,
                lastUpdated: new Date().toISOString()
            };

            this.save();
            console.log(chalk.green('✅ Data imported successfully'));
            return true;
        } catch (error) {
            console.error(chalk.red('❌ Import failed:'), error);
            return false;
        }
    }

    /**
     * Clean up old data (older than specified days)
     */
    cleanup(days = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffTime = cutoffDate.getTime();

        let cleanedCount = 0;

        // Clean old user data
        for (const [key, userData] of Object.entries(this.data.users)) {
            if (userData.lastUpdated) {
                const lastUpdate = new Date(userData.lastUpdated).getTime();
                if (lastUpdate < cutoffTime) {
                    delete this.data.users[key];
                    cleanedCount++;
                }
            }
        }

        if (cleanedCount > 0) {
            this.save();
            console.log(chalk.yellow(`🧹 Cleaned ${cleanedCount} old user records`));
        }

        return cleanedCount;
    }

    /**
     * Shutdown database (stop auto-save)
     */
    shutdown() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
        this.save();
        console.log(chalk.green('✅ Database shutdown complete'));
    }
}

// Create singleton instance
const db = new Database();

module.exports = db;