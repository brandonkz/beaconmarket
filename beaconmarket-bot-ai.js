#!/usr/bin/env node
/**
 * BeaconMarket WhatsApp Bot with AI Parsing
 * Uses Claude to intelligently parse natural language listings
 */

const { createClient } = require('@supabase/supabase-js');

// === CONFIG ===
const SUPABASE_URL = 'https://fuddzrlnbrseofguuikp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZGR6cmxuYnJzZW9mZ3V1aWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDE5NjMsImV4cCI6MjA4NzE3Nzk2M30.pAWnJbzoS-mWOt3LiCVSxb1exm8eT0_rAfT9kSt2XJo';
const BASE_URL = 'https://brandonkz.github.io/beaconmarket';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Rate limiting
const userMessageCount = new Map();

/**
 * Parse listing using AI (to be called by OpenClaw with LLM access)
 * This returns the prompt for Claude to parse
 */
function getAIParsePrompt(text) {
    return `Extract listing details from this natural language message for a community marketplace.

Message: "${text}"

Extract and return ONLY valid JSON with these fields:
{
  "category": "holiday-homes" | "equipment" | "services" | "events" | "parking",
  "title": "short descriptive title (max 60 chars)",
  "description": "full description including dates/details",
  "price": numeric value (convert "10k" to 10000, "5.5k" to 5500),
  "price_unit": "per night" | "per day" | "per hour" | "per week" | "per month" | "per service" | "total"
}

Category guidelines:
- Houses/homes/cottages/apartments/timeshares → "holiday-homes"
- Bikes/kayaks/SUPs/equipment/gear → "equipment"
- Cleaners/chefs/services → "services"
- Easels/tables/event supplies → "events"
- Garage/parking/storage → "parking"

Price unit guidelines:
- If specific dates mentioned (e.g., "June 30 to July 30") → "total" (for entire period)
- If "per night/day/hour" mentioned → use that
- Default for holiday homes → "per night"
- Default for equipment → "per day"

Examples:

Input: "Beacon isle time share for 30 June to 30 July for R10k"
Output: {
  "category": "holiday-homes",
  "title": "Beacon Isle timeshare - June 30 to July 30",
  "description": "Beacon Isle timeshare available from June 30 to July 30",
  "price": 10000,
  "price_unit": "total"
}

Input: "Mountain bike R200 per day"
Output: {
  "category": "equipment",
  "title": "Mountain bike rental",
  "description": "Mountain bike available for rent",
  "price": 200,
  "price_unit": "per day"
}

Input: "3 bed beach house sleeps 6 R12k per night"
Output: {
  "category": "holiday-homes",
  "title": "3-bed beach house",
  "description": "3-bedroom beach house, sleeps 6",
  "price": 12000,
  "price_unit": "per night"
}

Return ONLY the JSON object, no markdown, no explanation.`;
}

/**
 * Main message handler - integrates with OpenClaw
 */
async function handleMessage(messageText, senderNumber, senderName = null, aiParseFn = null) {
    const text = messageText.trim();
    const upperText = text.toUpperCase();
    
    // Check rate limit
    if (isRateLimited(senderNumber)) {
        return '⏸️ Too many commands. Please wait a few minutes.';
    }
    
    // Ignore very short messages
    if (text.length < 3) {
        return null;
    }
    
    // === COMMAND ROUTING ===
    
    if (upperText.startsWith('LIST:')) {
        return await handleListCommand(text, senderNumber, senderName, aiParseFn);
    }
    
    if (upperText.startsWith('SOLD')) {
        return await handleSoldCommand(text, senderNumber);
    }
    
    if (upperText.startsWith('EDIT:')) {
        return await handleEditCommand(text, senderNumber, aiParseFn);
    }
    
    if (upperText === 'HELP' || upperText.includes('BEACON') || upperText.includes('COMMAND')) {
        return getHelpMessage();
    }
    
    return null;
}

/**
 * Handle LIST command with AI parsing
 */
async function handleListCommand(text, senderNumber, senderName, aiParseFn) {
    const listingText = text.substring(5).trim();
    
    if (!listingText) {
        return `❌ Please provide listing details.

Example:
LIST: Mountain bike, R200 per day`;
    }
    
    let parsed;
    
    // Use AI parsing if available, fallback to simple parsing
    if (aiParseFn && typeof aiParseFn === 'function') {
        try {
            const prompt = getAIParsePrompt(listingText);
            const aiResponse = await aiParseFn(prompt);
            parsed = JSON.parse(aiResponse);
        } catch (error) {
            console.error('AI parsing failed:', error);
            // Fall back to simple parsing
            parsed = parseListingTextSimple(listingText);
        }
    } else {
        // Simple parsing fallback
        parsed = parseListingTextSimple(listingText);
    }
    
    if (!parsed.title || !parsed.price) {
        return `❌ Couldn't parse listing. Please include:
• What you're listing
• Price (e.g., R200/day or R10k total)

Example:
LIST: 3-bed beach house, June 20-30, R15k total`;
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
R${data[0].price.toLocaleString()} ${data[0].price_unit}

📱 View: ${BASE_URL}/listings.html

*To manage:*
• SOLD - Remove listing
• EDIT: [changes] - Update details`;
}

/**
 * Handle SOLD command (same as before)
 */
async function handleSoldCommand(text, senderNumber) {
    const cleanNumber = cleanPhoneNumber(senderNumber);
    
    const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .eq('whatsapp', cleanNumber)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
    
    if (!listings || listings.length === 0) {
        return '❌ You have no active listings.';
    }
    
    let targetListing = listings[0];
    
    if (text.length > 5) {
        const query = text.substring(5).trim().toLowerCase();
        const match = listings.find(l => l.title.toLowerCase().includes(query));
        if (match) targetListing = match;
    }
    
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
async function handleEditCommand(text, senderNumber, aiParseFn) {
    const changes = text.substring(5).trim();
    const cleanNumber = cleanPhoneNumber(senderNumber);
    
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
    const updates = {};
    
    // Simple keyword matching for now
    const priceMatch = changes.match(/price.*?(?:to|:)?\s*r?\s*(\d+k?)/i);
    if (priceMatch) {
        let price = priceMatch[1].toLowerCase();
        if (price.endsWith('k')) {
            price = parseInt(price) * 1000;
        } else {
            price = parseInt(price);
        }
        updates.price = price;
    }
    
    if (changes.toLowerCase().includes('description') || changes.toLowerCase().includes('add')) {
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
 * Simple fallback parsing (when AI not available)
 */
function parseListingTextSimple(text) {
    const priceMatch = text.match(/r\s*(\d+k?)/i);
    let price = null;
    
    if (priceMatch) {
        let priceStr = priceMatch[1].toLowerCase();
        if (priceStr.endsWith('k')) {
            price = parseInt(priceStr) * 1000;
        } else {
            price = parseInt(priceStr);
        }
    }
    
    let price_unit = 'per day';
    if (text.match(/night/i)) price_unit = 'per night';
    if (text.match(/hour/i)) price_unit = 'per hour';
    if (text.match(/week/i)) price_unit = 'per week';
    if (text.match(/month/i)) price_unit = 'per month';
    if (text.match(/service/i)) price_unit = 'per service';
    if (text.match(/total/i)) price_unit = 'total';
    
    let category = 'equipment';
    const lower = text.toLowerCase();
    
    if (lower.match(/house|home|cottage|apartment|flat|room|timeshare|time share/)) {
        category = 'holiday-homes';
    } else if (lower.match(/clean|chef|cook|dog|walk|handyman|plumb|electric|paint/)) {
        category = 'services';
    } else if (lower.match(/easel|table|chair|tent|gazebo|party|event/)) {
        category = 'events';
    } else if (lower.match(/garage|parking|storage/)) {
        category = 'parking';
    }
    
    let title = text.split(',')[0].trim();
    title = title.replace(/r\s*\d+.*/i, '').trim();
    if (title.length > 60) title = title.substring(0, 60);
    
    const description = text;
    
    return {
        category,
        title,
        description,
        price,
        price_unit
    };
}

function getHelpMessage() {
    return `🏖️ *BeaconMarket Commands*

📝 *List Something:*
LIST: Mountain bike, R200 per day
LIST: 3-bed beach house, R12000 per night, sleeps 6
LIST: Beacon Isle timeshare, June 30-July 30, R10k total

🗑️ *Remove Listing:*
SOLD (removes your most recent)
SOLD: bike (removes specific listing)

✏️ *Edit Listing:*
EDIT: Change price to R300
EDIT: Add "Helmet included"

📱 Browse all: ${BASE_URL}

All buyers contact you directly via WhatsApp - we just list it for you!`;
}

function cleanPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('27')) return cleaned;
    if (cleaned.startsWith('0')) return '27' + cleaned.substring(1);
    return '27' + cleaned;
}

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
    return userData.count > 5;
}

module.exports = { handleMessage, getAIParsePrompt };
