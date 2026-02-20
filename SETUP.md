# BeaconMarket - Quick Setup Guide

## Step-by-Step Setup (15 minutes)

### 1. Create Supabase Account (5 min)

1. Go to https://supabase.com
2. Sign up with GitHub (or email)
3. Click "New Project"
4. Fill in:
   - Project name: `beaconmarket`
   - Database password: (generate strong password, save it)
   - Region: `Southeast Asia (Singapore)` (closest to SA)
5. Wait 2-3 minutes for project creation

### 2. Create Database Table (2 min)

1. In Supabase dashboard, click "SQL Editor" (left sidebar)
2. Click "New Query"
3. Copy/paste this SQL:

```sql
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

alter table listings enable row level security;

create policy "Anyone can view active listings"
  on listings for select
  using (status = 'active');

create policy "Anyone can create listings"
  on listings for insert
  with check (true);

create index listings_category_idx on listings(category);
create index listings_created_at_idx on listings(created_at desc);
```

4. Click "Run" (or press Cmd/Ctrl + Enter)
5. Should see "Success. No rows returned"

### 3. Get API Credentials (1 min)

1. Click "Settings" (gear icon, left sidebar)
2. Click "API"
3. Copy these two values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 4. Configure Site (2 min)

1. Open `BeaconMarket/js/config.js`
2. Replace:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
   
   With your actual values:
   ```javascript
   const SUPABASE_URL = 'https://abcdefgh.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJ...your-key-here...';
   ```

3. Save the file

### 5. Test Locally (2 min)

1. Open `BeaconMarket/index.html` in your browser
2. You should see the marketplace homepage
3. Click "List Something"
4. Fill in a test listing
5. Submit
6. Go back to browse - your listing should appear

### 6. Deploy to GitHub Pages (3 min)

1. Create new repo on GitHub: `beaconmarket`
2. In terminal:
   ```bash
   cd ~/Documents/BeaconMarket
   git init
   git add .
   git commit -m "Initial BeaconMarket MVP"
   git branch -M main
   git remote add origin https://github.com/brandonkz/beaconmarket.git
   git push -u origin main
   ```

3. On GitHub repo page:
   - Click "Settings"
   - Click "Pages" (left sidebar)
   - Source: "Deploy from a branch"
   - Branch: `main`, folder: `/ (root)`
   - Click "Save"

4. Wait 1-2 minutes
5. Visit: `https://brandonkz.github.io/beaconmarket/`

### 7. Optional: Custom Domain

If you buy `beaconmarket.co.za`:

1. Add DNS CNAME record:
   - Host: `www`
   - Value: `brandonkz.github.io`
   - TTL: 3600

2. In GitHub Pages settings:
   - Custom domain: `www.beaconmarket.co.za`
   - Check "Enforce HTTPS"

## Troubleshooting

**"Supabase is not defined"**
- Check `js/config.js` credentials are correct
- Make sure Supabase CDN is loading (check browser console)

**"No listings found"**
- Check browser console for errors
- Verify Supabase table policies are set correctly
- Try creating a listing first

**WhatsApp button not working**
- Make sure phone number doesn't have spaces/dashes
- Should be in format: `0828868631` or `27828868631`

**Images not showing**
- Image URL must be a direct link (not Google Drive/Dropbox)
- Use Imgur, Google Photos share link, or Supabase Storage

## Next Steps

1. Create 5-10 seed listings to populate the marketplace
2. Share link in Fresnaye Community WhatsApp group
3. Post to Plett Facebook groups
4. Monitor Supabase dashboard for new listings
5. Gather feedback from first users

## Support

Issues? Contact:
- WhatsApp: 082 886 8631
- Email: hello@beaconmarket.co.za
