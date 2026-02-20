#!/usr/bin/env node
/**
 * BeaconMarket WhatsApp Automation
 * 
 * Handles incoming WhatsApp commands to create, edit, and remove listings.
 * 
 * Commands:
 * - LIST: [details] - Create new listing
 * - SOLD - Mark most recent listing as sold
 * - SOLD: [title] - Mark specific listing as sold
 * - EDIT: [changes] - Edit most recent listing
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const SUPABASE_URL = 'https://fuddzrlnbrseofguuikp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZGR6cmxuYnJzZW9mZ3V1aWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDE5NjMsImV4cCI6MjA4NzE3Nzk2M30.pAWnJbzoS-mWOt3LiCVSxb1exm8eT0_rAfT9kSt2XJo';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Parse listing details from natural language using Claude
 */
async function parseListingDetails(message, senderNumber) {
    // This will be called by the OpenClaw message handler
    // For now, return a structured prompt for Claude to parse
    
    const parsePrompt = `Extract listing details from this message. Return JSON only.

Message: "${message}"

Required fields:
- category: one of [holiday-homes, equipment, services, events, parking]
- title: short title
- description: full description
- price: numeric value
- price_unit: one of [per night, per day, per hour, per week, per month, per service]

Infer category from context:
- Houses/homes/cottages → holiday-homes
- Bikes/kayaks/SUPs/equipment → equipment
- Cleaners/chefs/services → services
- Easels/tables/party gear → events
- Garage/parking → parking

Example output:
{
  "category": "equipment",
  "title": "Mountain bike rental",
  "description": "Well-maintained mountain bike, perfect for trails",
  "price": 200,
  "price_unit": "per day"
}

Return JSON only, no explanation.`;

    return parsePrompt;
}

/**
 * Create a new listing in Supabase
 */
async function createListing(listingData, senderNumber, senderName = null) {
    const listing = {
        category: listingData.category,
        title: listingData.title,
        description: listingData.description,
        price: listingData.price,
        price_unit: listingData.price_unit,
        owner_name: senderName || extractNameFromNumber(senderNumber),
        whatsapp: senderNumber.replace(/\D/g, ''), // Clean number
        verified_resident: false, // Can be upgraded later
        status: 'active'
    };

    const { data, error } = await supabase
        .from('listings')
        .insert([listing])
        .select();

    if (error) {
        console.error('Error creating listing:', error);
        return { success: false, error };
    }

    return { success: true, data: data[0] };
}

/**
 * Find user's listings by phone number
 */
async function getUserListings(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('whatsapp', cleanNumber)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching listings:', error);
        return [];
    }

    return data || [];
}

/**
 * Mark listing as sold/inactive
 */
async function markAsSold(listingId) {
    const { data, error } = await supabase
        .from('listings')
        .update({ status: 'inactive' })
        .eq('id', listingId)
        .select();

    if (error) {
        console.error('Error marking as sold:', error);
        return { success: false, error };
    }

    return { success: true, data: data[0] };
}

/**
 * Update listing details
 */
async function updateListing(listingId, updates) {
    const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', listingId)
        .select();

    if (error) {
        console.error('Error updating listing:', error);
        return { success: false, error };
    }

    return { success: true, data: data[0] };
}

/**
 * Extract name from phone number (placeholder)
 */
function extractNameFromNumber(phoneNumber) {
    // In production, you'd look this up from contacts
    // For now, return a generic name
    return `Beacon Isle Resident`;
}

/**
 * Generate confirmation message
 */
function generateConfirmation(action, listing) {
    const baseUrl = 'https://brandonkz.github.io/beaconmarket';
    
    switch(action) {
        case 'created':
            return `✅ *Listing Created!*

${listing.title}
R${listing.price} ${listing.price_unit}

View: ${baseUrl}/listings.html

To remove: Reply "SOLD"
To edit: Reply "EDIT: [changes]"`;

        case 'sold':
            return `✅ *Listing Removed*

"${listing.title}" has been marked as sold and removed from the marketplace.

List something else? Reply "LIST: [details]"`;

        case 'updated':
            return `✅ *Listing Updated*

"${listing.title}" has been updated.

View: ${baseUrl}/listings.html`;

        default:
            return '✅ Done!';
    }
}

// Export functions for OpenClaw integration
module.exports = {
    parseListingDetails,
    createListing,
    getUserListings,
    markAsSold,
    updateListing,
    generateConfirmation
};

// Test mode - run directly
if (require.main === module) {
    console.log('BeaconMarket WhatsApp Automation loaded.');
    console.log('This script is designed to run via OpenClaw message handler.');
}
