/**
 * Game Killers Security™
 * SSL Certificate Checker
 * 
 * Run this script to verify your SSL certificates are properly configured
 * Usage: node check-certificates.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(text) {
    console.log();
    log('='.repeat(60), 'cyan');
    log(text, 'bright');
    log('='.repeat(60), 'cyan');
    console.log();
}