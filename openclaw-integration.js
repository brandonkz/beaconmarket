#!/usr/bin/env node
/**
 * OpenClaw Integration for BeaconMarket
 * 
 * This script can be called by OpenClaw when WhatsApp messages arrive.
 * It processes the message and returns a response to send back.
 * 
 * Usage:
 *   node openclaw-integration.js "LIST: Bike, R200/day" "0828868631" "Brandon"
 * 
 * Or import as module:
 *   const { processWhatsAppMessage } = require('./openclaw-integration.js');
 *   const response = await processWhatsAppMessage(message, sender, name);
 */

const { handleMessage } = require('./beaconmarket-bot.js');

/**
 * Process incoming WhatsApp message
 * 
 * @param {string} messageText - The text of the WhatsApp message
 * @param {string} senderNumber - Phone number of sender (format: 0828868631 or 27828868631)
 * @param {string} senderName - Name of sender (optional)
 * @returns {Promise<string|null>} Response to send back (or null for no response)
 */
async function processWhatsAppMessage(messageText, senderNumber, senderName = null) {
    try {
        const response = await handleMessage(messageText, senderNumber, senderName);
        return response;
    } catch (error) {
        console.error('Error processing message:', error);
        return '❌ An error occurred. Please try again.';
    }
}

/**
 * Log message for debugging
 */
function logMessage(sender, message, response) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${sender}: ${message}`);
    if (response) {
        console.log(`[${timestamp}] Bot: ${response.substring(0, 100)}...`);
    }
}

// === CLI MODE ===
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.error('Usage: node openclaw-integration.js "MESSAGE" "SENDER_NUMBER" ["SENDER_NAME"]');
        console.error('Example: node openclaw-integration.js "LIST: Bike, R200/day" "0828868631" "Brandon"');
        process.exit(1);
    }
    
    const [message, sender, name] = args;
    
    processWhatsAppMessage(message, sender, name || null)
        .then(response => {
            if (response) {
                console.log('\n=== BOT RESPONSE ===');
                console.log(response);
                console.log('====================\n');
            } else {
                console.log('(No response - not a command)');
            }
            process.exit(0);
        })
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
}

module.exports = { processWhatsAppMessage, logMessage };
