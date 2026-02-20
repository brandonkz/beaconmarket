#!/usr/bin/env node
/**
 * BeaconMarket WhatsApp Bot
 * 
 * Run this with: node beaconmarket-bot.js
 * Or integrate into OpenClaw message pipeline
 * 
 * This bot listens for WhatsApp messages and handles:
 * - LIST: Create listings
 * - SOLD: Remove listings  
 * - EDIT: Update listings
 * - HELP: Show commands
 */

const { createClient } = require('@supabase/supabase-js');

// === CONFIG ===
const SUPABASE_URL = 'https://fuddzrlnbrseofguuikp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZGR6cmxuYnJzZW9mZ3V1aWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDE5NjMsImV4cCI6MjA4NzE3Nzk2M30.pAWnJbzoS-mWOt3LiCVSxb1exm8eT0_rAfT9kSt2XJo';
const BASE_URL = 'https://brandonkz.github.io/beaconmarket';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Rate limiting: Track message count per user
const userMessageCount = new Map();

/**
 * Main message handler - call this from OpenClaw
 */
async function handleMessage(messageText, senderNumber, senderName = null) {
    const text = messageText.trim();
    const upperText = text.toUpperCase();
    
    // Check rate limit
    if (isRateLimited(senderNumber)) {
        return '⏸️ Too many commands. Please wait a few minutes.';
    }
    
    // Ignore very short messages
    if (text.length < 3) {
        return null; // No response
    }
    
    // === COMMAND ROUTING ===
    
    if (upperText.startsWith('LIST:')) {
        return await handleListCommand(text, senderNumber, senderName);
    }
    
    if (upperText.startsWith('SOLD')) {
        return await handleSoldCommand(text, senderNumber);
    }
    
    if (upperText.startsWith('EDIT:')) {
        return await handleEditCommand(text, senderNumber);
    }
    
    if (upperText === 'HELP' || upperText.includes('BEACON') || upperText.includes('COMMAND')) {
        return getHelpMessage();
    }
    
    // No command recognized - don't respond
    return null;
}

/**
 * Handle LIST command
 */
async function handleListCommand(text, senderNumber, senderName) {
    const listingText = text.substring(5).trim();
    
    if (!listingText) {
        return `❌ Please provide listing details.

Example:
LIST: Mountain bike, R200 per day`;
    }
    
    // Parse listing using simple regex patterns
    const parsed = await parseListingText(listingText);
    
    if (!parsed.title || !parsed.price) {
        return `❌ Missing required info. Please include:
• What you're listing
• Price (e.g., R200/day)

Example:
LIST: Mountain bike, R200 per day`;
    }
    
    // Create listing
    const listing = {
        category: parsed.category,
        title: parsed.title,
        description: parsed.description,
        price: parsed.price,
        price_unit: parsed.price_unit,
        owner_name: senderName || 'Beacon Isle Resident',
        whatsapp: cleanPhoneNumber(senderNumber),
        verified_resident: false,
        status: 'active'
    };
    
    const { data, error } = await supabase
        .from('listings')
        .insert([listing])
        .select();
    
    if (error) {
        console.error('Create error:', error);
        return '❌ Error creating listing. Please try again.';
    }
    
    return `✅ *Listing Created!*

${data[0].title}
R${data[0].price} ${data[0].price_unit}

📱 View: ${BASE_URL}/listings.html

*Commands:*
• SOLD - Remove listing
• EDIT: [changes] - Update details`;
}

/**
 * Handle SOLD command
 */
async function handleSoldCommand(text, senderNumber) {
    const cleanNumber = cleanPhoneNumber(senderNumber);
    
    // Get user's active listings
    const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .eq('whatsapp', cleanNumber)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
    
    if (!listings || listings.length === 0) {
        return '❌ You have no active listings.';
    }
    
    // Check if specific listing mentioned
    let targetListing = listings[0]; // Default to most recent
    
    if (text.length > 5) {
        const query = text.substring(5).trim().toLowerCase();
        const match = listings.find(l => l.title.toLowerCase().includes(query));
        if (match) targetListing = match;
    }
    
    // Mark as sold
    const { error } = await supabase
        .from('listings')
        .update({ status: 'inactive' })
        .eq('id', targetListing.id);
    
    if (error) {
        return '❌ Error removing listing.';
    }
    
    return `✅ *Listing Removed*

"${targetListing.title}" has been marked as sold.

List something else? Reply:
LIST: [details]`;
}

/**
 * Handle EDIT command
 */
async function handleEditCommand(text, senderNumber) {
    const changes = text.substring(5).trim();
    const cleanNumber = cleanPhoneNumber(senderNumber);
    
    // Get user's most recent listing
    const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .eq('whatsapp', cleanNumber)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);
    
    if (!listings || listings.length === 0) {
        return '❌ You have no active listings to edit.';
    }
    
    const listing = listings[0];
    
    // Parse what to update (simple keyword matching)
    const updates = {};
    
    // Check for price change
    const priceMatch = changes.match(/price.*?(?:to|:)?\s*r?\s*(\d+)/i);
    if (priceMatch) {
        updates.price = parseInt(priceMatch[1]);
    }
    
    // Check for description update
    if (changes.toLowerCase().includes('description') || changes.toLowerCase().includes('add')) {
        // Extract quoted text or text after "to"
        const descMatch = changes.match(/["'](.+)["']/) || changes.match(/to\s+(.+)/i);
        if (descMatch) {
            updates.description = listing.description + ' ' + descMatch[1];
        }
    }
    
    if (Object.keys(updates).length === 0) {
        return `❌ Couldn't understand edit request.

Examples:
• EDIT: Change price to R300
• EDIT: Add "Helmet included"`;
    }
    
    const { error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', listing.id);
    
    if (error) {
        return '❌ Error updating listing.';
    }
    
    return `✅ *Listing Updated*

"${listing.title}"

View: ${BASE_URL}/listings.html`;
}

/**
 * Parse listing text into structured data
 */
async function parseListingText(text) {
    // Extract price
    const priceMatch = text.match(/r\s*(\d+)/i);
    const price = priceMatch ? parseInt(priceMatch[1]) : null;
    
    // Determine price unit
    let price_unit = 'per day'; // default
    if (text.match(/night/i)) price_unit = 'per night';
    if (text.match(/hour/i)) price_unit = 'per hour';
    if (text.match(/week/i)) price_unit = 'per week';
    if (text.match(/month/i)) price_unit = 'per month';
    if (text.match(/service/i)) price_unit = 'per service';
    
    // Determine category from keywords
    let category = 'equipment'; // default
    const lower = text.toLowerCase();
    
    if (lower.match(/house|home|cottage|apartment|flat|room/)) {
        category = 'holiday-homes';
    } else if (lower.match(/clean|chef|cook|dog|walk|handyman|plumb|electric|paint/)) {
        category = 'services';
    } else if (lower.match(/easel|table|chair|tent|gazebo|party|event/)) {
        category = 'events';
    } else if (lower.match(/garage|parking|storage/)) {
        category = 'parking';
    }
    
    // Extract title (first part before comma or price)
    let title = text.split(',')[0].trim();
    title = title.replace(/r\s*\d+.*/i, '').trim();
    if (title.length > 60) title = title.substring(0, 60);
    
    // Description is the full text
    const description = text;
    
    return {
        category,
        title,
        description,
        price,
        price_unit
    };
}

/**
 * Get help message
 */
function getHelpMessage() {
    return `🏖️ *BeaconMarket Commands*

📝 *List Something:*
LIST: Mountain bike, R200 per day
LIST: 3-bed beach house, R12000 per night, sleeps 6
LIST: Professional cleaner, R250 per service

🗑️ *Remove Listing:*
SOLD (removes your most recent)
SOLD: bike (removes specific listing)

✏️ *Edit Listing:*
EDIT: Change price to R300
EDIT: Add "Helmet included"

📱 Browse all: ${BASE_URL}

All buyers contact you directly via WhatsApp - we just list it for you!`;
}

/**
 * Clean phone number
 */
function cleanPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('27')) return cleaned;
    if (cleaned.startsWith('0')) return '27' + cleaned.substring(1);
    return '27' + cleaned;
}

/**
 * Rate limiting check
 */
function isRateLimited(phoneNumber) {
    const now = Date.now();
    const userKey = cleanPhoneNumber(phoneNumber);
    
    if (!userMessageCount.has(userKey)) {
        userMessageCount.set(userKey, { count: 1, resetAt: now + 60000 });
        return false;
    }
    
    const userData = userMessageCount.get(userKey);
    
    if (now > userData.resetAt) {
        userData.count = 1;
        userData.resetAt = now + 60000;
        return false;
    }
    
    userData.count++;
    
    // Max 5 commands per minute
    return userData.count > 5;
}

// === EXPORTS ===
module.exports = { handleMessage };

// === CLI MODE (for testing) ===
if (require.main === module) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    console.log('🏖️ BeaconMarket Bot - Test Mode');
    console.log('Type commands as if you were sending WhatsApp messages\n');
    
    const testNumber = '0837787970';
    
    rl.on('line', async (line) => {
        const response = await handleMessage(line, testNumber, 'Test User');
        if (response) {
            console.log('\n' + response + '\n');
        } else {
            console.log('(no response - not a command)\n');
        }
    });
}
