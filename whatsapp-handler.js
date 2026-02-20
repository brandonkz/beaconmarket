#!/usr/bin/env node
/**
 * BeaconMarket WhatsApp Handler for OpenClaw
 * 
 * This script handles incoming WhatsApp messages and routes them to the BeaconMarket bot.
 * It's designed to be called by OpenClaw when a WhatsApp message arrives.
 * 
 * Usage:
 *   node whatsapp-handler.js <message> <sender> <senderName>
 */

const { handleMessage, getAIParsePrompt } = require('./beaconmarket-bot-ai.js');

// AI parsing function that uses OpenClaw's LLM
async function aiParse(prompt) {
    // In a real OpenClaw integration, this would call the LLM via OpenClaw's API
    // For now, we'll use a simple mock implementation
    
    // Extract the message from the prompt
    const messageMatch = prompt.match(/Message: "(.+?)"/);
    if (!messageMatch) {
        throw new Error('Could not extract message from prompt');
    }
    
    const text = messageMatch[1].toLowerCase();
    
    // Smart parsing logic
    let category = 'equipment';
    let title = '';
    let description = text;
    let price = null;
    let price_unit = 'per day';
    
    // Extract price (handles "10k", "R200", etc.)
    const priceMatch = text.match(/r?\s*(\d+\.?\d*)\s*k/i) || text.match(/r\s*(\d+)/i);
    if (priceMatch) {
        if (text.includes('k')) {
            price = parseFloat(priceMatch[1]) * 1000;
        } else {
            price = parseInt(priceMatch[1]);
        }
    }
    
    // Determine category
    if (text.match(/house|home|cottage|apartment|timeshare|time share|flat|accommodation/i)) {
        category = 'holiday-homes';
    } else if (text.match(/clean|chef|handyman|service|dog walk|tutor|massage/i)) {
        category = 'services';
    } else if (text.match(/easel|table|tent|party|event|chair|gazebo/i)) {
        category = 'events';
    } else if (text.match(/garage|parking|storage/i)) {
        category = 'parking';
    }
    
    // Determine price unit (smart detection based on context)
    if (text.match(/total|for the period|entire|for [a-z]+ \d+\s+to\s+[a-z]+ \d+/i)) {
        price_unit = 'total';
    } else if (text.match(/per night|\/night|a night/i)) {
        price_unit = 'per night';
    } else if (text.match(/per hour|\/hour|hourly/i)) {
        price_unit = 'per hour';
    } else if (text.match(/per week|\/week|weekly/i)) {
        price_unit = 'per week';
    } else if (text.match(/per month|\/month|monthly/i)) {
        price_unit = 'per month';
    } else if (text.match(/per service|per job/i)) {
        price_unit = 'per service';
    } else if (category === 'holiday-homes') {
        // For holiday homes, if dates are mentioned, assume total
        if (text.match(/\d+\s+\w+\s+to\s+\d+\s+\w+/i)) {
            price_unit = 'total';
        } else {
            price_unit = 'per night';
        }
    }
    
    // Create intelligent title
    if (text.match(/timeshare|time share/i)) {
        const dateMatch = text.match(/(\d+\s+\w+\s+to\s+\d+\s+\w+)/i);
        if (dateMatch) {
            title = `Beacon Isle timeshare - ${dateMatch[1]}`;
            description = `Beacon Isle timeshare available ${dateMatch[1]}`;
        } else {
            title = 'Beacon Isle timeshare';
        }
    } else {
        // Extract first meaningful words for title
        const words = text.split(/[,\.]|for r/i)[0].trim();
        title = words.substring(0, 60);
    }
    
    const result = {
        category,
        title: title.charAt(0).toUpperCase() + title.slice(1),
        description: description.charAt(0).toUpperCase() + description.slice(1),
        price,
        price_unit
    };
    
    return JSON.stringify(result);
}

// Main handler
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.error('Usage: node whatsapp-handler.js <message> [sender] [senderName]');
        process.exit(1);
    }
    
    const message = args[0];
    const sender = args[1] || '0837787970';
    const senderName = args[2] || null;
    
    try {
        const response = await handleMessage(message, sender, senderName, aiParse);
        
        if (response) {
            console.log(response);
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { aiParse };
