#!/usr/bin/env node
/**
 * Test BeaconMarket bot with AI parsing
 * Simulates Claude AI parsing for natural language
 */

const { handleMessage, getAIParsePrompt } = require('./beaconmarket-bot-ai.js');

// Simulate AI parsing function (in production, this would call Claude via OpenClaw)
async function mockAIParse(prompt) {
    // Extract the user message from the prompt
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
    
    // Extract price
    const priceMatch = text.match(/r?\s*(\d+\.?\d*)\s*k/i) || text.match(/r\s*(\d+)/i);
    if (priceMatch) {
        if (text.includes('k')) {
            price = parseFloat(priceMatch[1]) * 1000;
        } else {
            price = parseInt(priceMatch[1]);
        }
    }
    
    // Determine category
    if (text.match(/house|home|cottage|apartment|timeshare|time share|flat/i)) {
        category = 'holiday-homes';
    } else if (text.match(/clean|chef|handyman|service/i)) {
        category = 'services';
    } else if (text.match(/easel|table|tent|party|event/i)) {
        category = 'events';
    } else if (text.match(/garage|parking|storage/i)) {
        category = 'parking';
    }
    
    // Determine price unit
    if (text.match(/total|for the period|entire/i) || text.match(/\d+\s+(june|july|august|to|until)/i)) {
        price_unit = 'total';
    } else if (text.match(/night/i)) {
        price_unit = 'per night';
    } else if (text.match(/hour/i)) {
        price_unit = 'per hour';
    } else if (text.match(/week/i)) {
        price_unit = 'per week';
    } else if (text.match(/month/i)) {
        price_unit = 'per month';
    } else if (text.match(/service/i)) {
        price_unit = 'per service';
    } else if (category === 'holiday-homes') {
        price_unit = 'per night';
    }
    
    // Create title
    if (text.includes('timeshare') || text.includes('time share')) {
        const dateMatch = text.match(/(\d+\s+\w+\s+to\s+\d+\s+\w+)|(\w+\s+\d+\s+to\s+\w+\s+\d+)|(\d+\s+to\s+\d+\s+\w+)/i);
        if (dateMatch) {
            title = `Beacon Isle timeshare - ${dateMatch[0]}`;
            description = `Beacon Isle timeshare available ${dateMatch[0]}`;
        } else {
            title = 'Beacon Isle timeshare';
        }
    } else {
        // Extract first meaningful words
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

// Test with command line arguments
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.error('Usage: node test-ai-bot.js "MESSAGE" "SENDER_NUMBER" ["SENDER_NAME"]');
        console.error('Example: node test-ai-bot.js "LIST: Beacon isle timeshare June 30 to July 30 for R10k" "0837787970" "Brandon"');
        process.exit(1);
    }
    
    const [message, sender, name] = args;
    
    handleMessage(message, sender, name || null, mockAIParse)
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

module.exports = { mockAIParse };
