# BeaconMarket

Hyperlocal marketplace for Beacon Isle, Plettenberg Bay. Rent holiday homes, borrow equipment, find services - all within the estate community.

## Features

- **Holiday Homes**: Book direct from owners, no Airbnb fees
- **Equipment Rentals**: Bikes, kayaks, SUPs, braai gear, event supplies
- **Services**: Cleaners, chefs, dog walkers, handymen
- **Parking & Storage**: Rent out extra garage space
- **WhatsApp Integration**: Direct contact with owners
- **Community Trust**: Verified Beacon Isle residents only

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL + real-time subscriptions)
- **Hosting**: GitHub Pages
- **No escrow** (MVP) - direct WhatsApp contact between parties

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

### 2. Create Database Table

Run this SQL in Supabase SQL Editor:

```sql
-- Create listings table
create table listings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  category text not null,
  title text not null,
  description text not null,
  price numeric not null,
  price_unit text not null,
  owner_name text not null,
  whatsapp text not null,
  email text,
  image_url text,
  verified_resident boolean default false,
  views integer default 0,
  status text default 'active'
);

-- Enable Row Level Security
alter table listings enable row level security;

-- Policy: Anyone can read listings
create policy "Anyone can view active listings"
  on listings for select
  using (status = 'active');

-- Policy: Anyone can create listings (for MVP)
create policy "Anyone can create listings"
  on listings for insert
  with check (true);

-- Optional: Create index for better performance
create index listings_category_idx on listings(category);
create index listings_created_at_idx on listings(created_at desc);
```

### 3. Configure Supabase Credentials

Edit `js/config.js` and replace:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### 4. Deploy to GitHub Pages

```bash
cd ~/Documents/BeaconMarket
git init
git add .
git commit -m "Initial BeaconMarket MVP"
git branch -M main
git remote add origin https://github.com/brandonkz/beaconmarket.git
git push -u origin main

# Enable GitHub Pages in repo settings
# Point to main branch, root directory
```

Site will be live at: `https://brandonkz.github.io/beaconmarket/`

### 5. Optional: Custom Domain

1. Buy `beaconmarket.co.za`
2. Add CNAME record pointing to `brandonkz.github.io`
3. Configure custom domain in GitHub Pages settings

## Roadmap

### Phase 1 (MVP - Current)
- ✅ Listing creation
- ✅ Browse by category
- ✅ WhatsApp contact
- ✅ No payments/escrow

### Phase 2 (Trust & Growth)
- [ ] User accounts (Supabase Auth)
- [ ] Star ratings & reviews
- [ ] WhatsApp bot for new listings
- [ ] Calendar availability for holiday homes
- [ ] Photo upload (Supabase Storage)

### Phase 3 (Monetization)
- [ ] TradeSafe escrow integration
- [ ] Featured listings (R50/month)
- [ ] Commission on high-value bookings
- [ ] Expand to other Plett estates (Sanctuary, The Island, etc.)

## Monetization Strategy

**Free tier** (current):
- List anything for free
- Direct WhatsApp contact
- Community trust model

**Paid features** (later):
- Featured listings: R50/month (top of category)
- Escrow for high-value items: 5-10% fee
- Premium holiday home listings: R200/month

**Target**: R5-10k/month revenue at scale (200-300 active listings)

## Marketing

1. **Launch in Fresnaye Community Chat** (you're already in it)
2. Post to other Plett estate groups
3. Facebook groups: Plett Residents, Beacon Isle Community
4. Word of mouth (estate managers, cleaners, property managers)

## Support

Contact: hello@beaconmarket.co.za  
WhatsApp: 082 886 8631

---

Built by Brandon Katz for the Beacon Isle community 🏖️
