# BeaconMarket WhatsApp Bot Setup

## Quick Start

The bot is ready to go! Here's how to activate it:

### 1. Install Dependencies

```bash
cd ~/Documents/BeaconMarket
npm init -y
npm install @supabase/supabase-js
```

### 2. Test Locally (Optional)

Test the bot in your terminal before connecting to WhatsApp:

```bash
node beaconmarket-bot.js
```

Try these commands:
```
LIST: Mountain bike, R200 per day
SOLD
LIST: 3-bed beach house, sleeps 6, R12000 per night
EDIT: Change price to R10000
HELP
```

### 3. Integrate with OpenClaw

Create a simple wrapper that calls the bot when WhatsApp messages arrive.

**Option A: Using OpenClaw's message tool (recommended)**

I can set up a listener that:
1. Monitors your WhatsApp (082 886 8631)
2. Calls `beaconmarket-bot.js` for each message
3. Sends the response back automatically

**Option B: Manual relay (for testing)**

When you get a WhatsApp message:
1. Run: `node beaconmarket-bot.js`
2. Paste the message
3. Copy the response
4. Send it back manually

We'll automate this in the next step.

## How It Works

### User Flow

**Creating a listing:**
```
User → WhatsApp: "LIST: Kayak, R150 per day"
Bot → Parses message
Bot → Creates in Supabase
Bot → Replies: "✅ Listing created! View: [link]"
```

**Removing a listing:**
```
User → WhatsApp: "SOLD"
Bot → Finds their latest listing
Bot → Marks as inactive
Bot → Replies: "✅ Listing removed"
```

**Editing:**
```
User → WhatsApp: "EDIT: Change price to R200"
Bot → Updates Supabase
Bot → Replies: "✅ Updated"
```

### Commands Supported

| Command | Example | Result |
|---------|---------|--------|
| **LIST:** | `LIST: Bike, R200/day` | Creates listing |
| **SOLD** | `SOLD` | Removes latest listing |
| **SOLD:** | `SOLD: bike` | Removes specific listing |
| **EDIT:** | `EDIT: Change price to R300` | Updates listing |
| **HELP** | `HELP` | Shows commands |

### What Gets Auto-Detected

**Category** (inferred from keywords):
- "house", "cottage" → holiday-homes
- "bike", "kayak", "SUP" → equipment
- "cleaner", "chef" → services
- "easel", "table" → events
- "garage", "parking" → parking

**Price**:
- Extracts from "R200", "R12000", "r 150"

**Price Unit**:
- "night" → per night
- "day" → per day
- "hour" → per hour
- "week" → per week
- "month" → per month
- Default → per day

### Rate Limits

To prevent abuse:
- Max **5 commands per minute** per number
- After that: _"⏸️ Too many commands. Please wait."_

### Contact Info

When someone creates a listing:
- **Their WhatsApp number** becomes the contact
- Buyers click "WhatsApp" → chat opens with seller
- You're hands-off (unless they ask for help)

## Next Step: Automation

Want me to set up the full automation so incoming WhatsApp messages are handled automatically?

I can create:
1. A background service that monitors your WhatsApp
2. Auto-responds to commands
3. Logs all activity
4. Sends you daily summary

This would run 24/7 on your Mac (or a server if you deploy it).

**Cost:** ~12,000 tokens/day for 10 listings = **$0.04/day** = **$1.20/month**

Ready to activate it?
