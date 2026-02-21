# Fresnaye Community Marketplace

Premium community marketplace for Fresnaye & Beacon Isle residents.

## Features

**Three distinct sections:**

1. **Beacon Isle Estate** - Beach equipment, holiday homes, facility bookings
2. **Second-Hand Marketplace** - Buy & sell within the community  
3. **Property Rentals** - Holiday and long-term rentals

**Plus:**
- WhatsApp AI assistant (083 778 7970)
- Advertisement space for local businesses
- Premium, upper-class design
- Mobile-responsive

## Deployment

### GitHub Pages

```bash
cd ~/Documents/BeaconMarket
git add fresnaye/
git commit -m "Add Fresnaye community marketplace"
git push
```

Site will be live at:
**https://brandonkz.github.io/beaconmarket/fresnaye/**

### Custom Domain (Optional)

If you buy `fresnaye-market.co.za`:

1. Add CNAME record: `www` → `brandonkz.github.io`
2. Add `CNAME` file to `/fresnaye/` with: `www.fresnaye-market.co.za`
3. Configure in GitHub Pages settings

## WhatsApp Bot Commands

Residents WhatsApp **083 778 7970**:

```
LIST: Mountain bike, R2000
LIST: 3-bed holiday home, June 20-30, R15k total
SOLD
EDIT: Change price to R1500
HELP
```

## Launch Plan

**Week 1: Soft Launch**
1. Seed with 3-5 test listings
2. Share with 5 friends in Fresnaye group
3. Fix bugs, gather feedback

**Week 2: Public Launch**
1. Post in Fresnaye 2nd-hand WhatsApp group
2. Post in main Fresnaye community group
3. Monitor for inbound leads

**Week 3: Convert Leads**
1. Demo to property owners/CEOs who DM
2. Close first R5k/month client
3. Get testimonial for other pitches

## Customization

- Logo: Update `.logo` in `index.html`
- Colors: Edit CSS variables in `fresnaye-style.css`
- Ad space: Replace placeholder in "Community Sponsor" section
- WhatsApp number: Find/replace `083 778 7970` across all files

## Analytics

Add Google Analytics tracking:

```html
<!-- Add before </head> in index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## Monetization

**Advertisement space:**
- R500-1,000/month for local businesses
- Banner placement on homepage
- Reaches high-income Fresnaye residents

**Future: Premium listings:**
- Featured placement: R50/listing
- Multi-photo galleries: R30/listing
- Promoted to top: R20/week

---

Built for the Fresnaye & Beacon Isle community 🏖️
