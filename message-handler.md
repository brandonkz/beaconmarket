# BeaconMarket WhatsApp Message Handler

This handler processes incoming WhatsApp messages and manages BeaconMarket listings automatically.

## Setup in OpenClaw

You'll need to configure OpenClaw to run this handler whenever a WhatsApp message arrives.

## Message Handler Logic

```javascript
// BeaconMarket WhatsApp Handler
// Triggered on incoming WhatsApp messages

const message = context.message;
const sender = context.sender; // Phone number
const text = message.text;

// Ignore if not a command
if (!text || text.length < 3) {
    return; // No response needed
}

const upperText = text.toUpperCase();

// === LIST COMMAND ===
if (upperText.startsWith('LIST:')) {
    const listingText = text.substring(5).trim();
    
    // Use Claude to parse listing details
    const parsePrompt = `Extract listing details from this message. Return JSON only.

Message: "${listingText}"

Required fields:
- category: one of [holiday-homes, equipment, services, events, parking]
- title: short descriptive title (max 60 chars)
- description: full description
- price: numeric value only
- price_unit: one of [per night, per day, per hour, per week, per month, per service]

Infer category from context:
- Houses/homes/cottages/apartments → holiday-homes
- Bikes/kayaks/SUPs/surfboards/equipment/gear → equipment  
- Cleaners/chefs/dog walkers/handyman → services
- Easels/tables/chairs/party supplies → events
- Garage/parking/storage → parking

If price not specified, ask user.
If category unclear, default to "equipment".

Return ONLY valid JSON, no markdown, no explanation.`;

    // Call Claude to parse (you'd use OpenClaw's built-in LLM call here)
    const parsed = await callClaude(parsePrompt);
    const listingData = JSON.parse(parsed);
    
    // Validate required fields
    if (!listingData.title || !listingData.price) {
        await reply(`❌ Missing info. Please include:
- What you're listing
- Price (e.g., R200/day)

Example: LIST: Mountain bike, R200 per day`);
        return;
    }
    
    // Create listing in Supabase
    const { createListing, generateConfirmation } = require('./whatsapp-automation.js');
    const result = await createListing(listingData, sender);
    
    if (result.success) {
        const confirmation = generateConfirmation('created', result.data);
        await reply(confirmation);
    } else {
        await reply('❌ Error creating listing. Please try again.');
    }
}

// === SOLD COMMAND ===
else if (upperText.startsWith('SOLD')) {
    const { getUserListings, markAsSold, generateConfirmation } = require('./whatsapp-automation.js');
    
    // Get user's active listings
    const listings = await getUserListings(sender);
    
    if (listings.length === 0) {
        await reply('❌ You have no active listings.');
        return;
    }
    
    // If "SOLD: title" format, find specific listing
    if (upperText.length > 5) {
        const titleQuery = text.substring(5).trim().toLowerCase();
        const match = listings.find(l => l.title.toLowerCase().includes(titleQuery));
        
        if (match) {
            await markAsSold(match.id);
            await reply(generateConfirmation('sold', match));
        } else {
            await reply(`❌ Couldn't find listing matching "${titleQuery}". Try: SOLD (to remove most recent)`);
        }
    } else {
        // Mark most recent as sold
        const latest = listings[0];
        await markAsSold(latest.id);
        await reply(generateConfirmation('sold', latest));
    }
}

// === EDIT COMMAND ===
else if (upperText.startsWith('EDIT:')) {
    const { getUserListings, updateListing, generateConfirmation } = require('./whatsapp-automation.js');
    const changes = text.substring(5).trim();
    
    const listings = await getUserListings(sender);
    
    if (listings.length === 0) {
        await reply('❌ You have no active listings to edit.');
        return;
    }
    
    // Parse what needs to be changed using Claude
    const editPrompt = `User wants to edit their listing. Extract the changes.

Current listing:
Title: ${listings[0].title}
Description: ${listings[0].description}
Price: R${listings[0].price} ${listings[0].price_unit}

Requested changes: "${changes}"

Return JSON with only the fields that should be updated:
{ "price": 150, "description": "new description" }

Return ONLY valid JSON.`;
    
    const parsed = await callClaude(editPrompt);
    const updates = JSON.parse(parsed);
    
    const result = await updateListing(listings[0].id, updates);
    
    if (result.success) {
        await reply(generateConfirmation('updated', result.data));
    } else {
        await reply('❌ Error updating listing. Try: EDIT: Change price to R300');
    }
}

// === HELP COMMAND ===
else if (upperText === 'HELP' || upperText.includes('BEACON')) {
    await reply(`🏖️ *BeaconMarket Commands*

📝 *Create Listing:*
LIST: Mountain bike, R200 per day

🗑️ *Remove Listing:*
SOLD (removes most recent)
SOLD: bike (removes specific)

✏️ *Edit Listing:*
EDIT: Change price to R300
EDIT: Add "Helmet included" to description

View all listings:
https://brandonkz.github.io/beaconmarket/`);
}

// === IGNORE OTHER MESSAGES ===
// Don't respond to casual chat, only to commands
```

## Integration with OpenClaw

You can implement this in two ways:

### Option 1: Add to workspace automation
Create a file that OpenClaw loads on startup to handle messages.

### Option 2: Manual trigger
For testing, you can manually trigger the handler when you receive messages.

## Rate Limiting

To prevent abuse:
- Max 5 listings per day per number
- Max 1 listing per 5 minutes per number
- Auto-flag if >10 listings in 24 hours

## Next Steps

1. Install Supabase client: `npm install @supabase/supabase-js`
2. Test with your own number first
3. Gradually open to community
4. Monitor for spam/quality issues
