// BeaconMarket App - Supabase Functions

// Get recent listings (for homepage)
async function getRecentListings(limit = 6) {
    try {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching recent listings:', error);
        return [];
    }
}

// Get all listings (for browse page)
async function getAllListings() {
    try {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching all listings:', error);
        return [];
    }
}

// Get listings by category
async function getListingsByCategory(category) {
    try {
        const { data, error } = await supabase
            .from('listings')
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching listings by category:', error);
        return [];
    }
}

// Create a new listing
async function createListing(listing) {
    try {
        const { data, error } = await supabase
            .from('listings')
            .insert([listing])
            .select();
        
        if (error) throw error;
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Error creating listing:', error);
        return { success: false, error };
    }
}

// Display listings in the grid
function displayListings(listings, containerId) {
    const container = document.getElementById(containerId);
    
    if (!listings || listings.length === 0) {
        container.innerHTML = '<p class="loading">No listings found.</p>';
        return;
    }
    
    container.innerHTML = listings.map(listing => {
        const categoryLabels = {
            'holiday-homes': 'Holiday Home',
            'equipment': 'Equipment',
            'services': 'Service',
            'events': 'Event Gear',
            'parking': 'Parking'
        };
        
        const whatsappNumber = listing.whatsapp.startsWith('27') ? listing.whatsapp : `27${listing.whatsapp}`;
        const whatsappMessage = encodeURIComponent(`Hi! I'm interested in: ${listing.title}`);
        
        const imageHtml = listing.image_url 
            ? `<img src="${listing.image_url}" alt="${listing.title}" class="listing-image">`
            : `<div class="listing-image" style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">${getCategoryEmoji(listing.category)}</div>`;
        
        return `
            <div class="listing-card">
                ${imageHtml}
                <div class="listing-content">
                    <span class="listing-category">${categoryLabels[listing.category] || listing.category}</span>
                    <h3 class="listing-title">${listing.title}</h3>
                    <p class="listing-description">${listing.description}</p>
                    <div class="listing-footer">
                        <div class="listing-price">
                            R${listing.price}
                            <span class="listing-price-unit">${listing.price_unit}</span>
                        </div>
                        <a href="https://wa.me/${whatsappNumber}?text=${whatsappMessage}" 
                           class="contact-btn" 
                           target="_blank">
                            💬 WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Get emoji for category
function getCategoryEmoji(category) {
    const emojis = {
        'holiday-homes': '🏡',
        'equipment': '🚴',
        'services': '🧹',
        'events': '🎨',
        'parking': '🚗'
    };
    return emojis[category] || '📦';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}
