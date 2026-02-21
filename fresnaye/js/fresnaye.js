// Fresnaye Marketplace - JavaScript

// Load listings on page load
window.addEventListener('DOMContentLoaded', async () => {
    await loadBeaconIsleListings();
    await loadMarketplaceListings();
    await loadRentalListings();
    
    // Set up filters
    setupFilters();
});

// Load Beacon Isle specific listings
async function loadBeaconIsleListings() {
    try {
        const { data, error } = await supabaseClient
            .from('listings')
            .select('*')
            .eq('category', 'equipment') // Beach/estate equipment
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(6);
        
        if (error) throw error;
        
        const container = document.getElementById('beacon-listings');
        if (data && data.length > 0) {
            displayListings(data, 'beacon-listings');
        } else {
            container.innerHTML = '<p class="empty-state">No Beacon Isle listings yet. List your beach gear or holiday home!</p>';
        }
    } catch (error) {
        console.error('Error loading Beacon Isle listings:', error);
    }
}

// Load marketplace (second-hand) listings
async function loadMarketplaceListings() {
    try {
        const { data, error} = await supabaseClient
            .from('listings')
            .select('*')
            .in('category', ['equipment', 'events', 'parking']) // Second-hand items
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(12);
        
        if (error) throw error;
        
        const container = document.getElementById('marketplace-listings');
        if (data && data.length > 0) {
            displayListings(data, 'marketplace-listings');
        } else {
            container.innerHTML = '<p class="empty-state">No listings yet. Be the first to list something!</p>';
        }
    } catch (error) {
        console.error('Error loading marketplace listings:', error);
    }
}

// Load rental listings
async function loadRentalListings() {
    try {
        const { data, error } = await supabaseClient
            .from('listings')
            .select('*')
            .eq('category', 'holiday-homes')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(6);
        
        if (error) throw error;
        
        const container = document.getElementById('rental-listings');
        if (data && data.length > 0) {
            displayListings(data, 'rental-listings');
        } else {
            container.innerHTML = '<p class="empty-state">No rental properties listed yet. List your property!</p>';
        }
    } catch (error) {
        console.error('Error loading rental listings:', error);
    }
}

// Setup filter functionality
function setupFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterMarketplace);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', filterMarketplace);
    }
}

// Filter marketplace listings
async function filterMarketplace() {
    const category = document.getElementById('category-filter')?.value;
    const search = document.getElementById('search-input')?.value.toLowerCase();
    
    try {
        let query = supabaseClient
            .from('listings')
            .select('*')
            .eq('status', 'active');
        
        // Don't include holiday-homes in marketplace
        query = query.neq('category', 'holiday-homes');
        
        if (category) {
            // Map UI categories to database categories
            const categoryMap = {
                'furniture': 'events',
                'electronics': 'equipment',
                'sports': 'equipment',
                'kids': 'events',
                'home': 'events',
                'other': 'parking'
            };
            const dbCategory = categoryMap[category] || category;
            query = query.eq('category', dbCategory);
        }
        
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Filter by search text
        let filtered = data;
        if (search) {
            filtered = data.filter(item => 
                item.title.toLowerCase().includes(search) ||
                item.description.toLowerCase().includes(search)
            );
        }
        
        const container = document.getElementById('marketplace-listings');
        if (filtered && filtered.length > 0) {
            displayListings(filtered, 'marketplace-listings');
        } else {
            container.innerHTML = '<p class="empty-state">No listings match your filters.</p>';
        }
    } catch (error) {
        console.error('Error filtering marketplace:', error);
    }
}

// Helper function to get category label
function getCategoryLabel(category) {
    const labels = {
        'equipment': 'Equipment',
        'holiday-homes': 'Holiday Home',
        'services': 'Service',
        'events': 'Second Hand',
        'parking': 'Other'
    };
    return labels[category] || category;
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
