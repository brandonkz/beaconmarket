# BeaconMarket Launch Checklist

## Pre-Launch Setup

### 1. Supabase Setup
- [ ] Create Supabase account at https://supabase.com
- [ ] Create new project named "beaconmarket"
- [ ] Copy Project URL
- [ ] Copy anon/public API key
- [ ] Run SQL to create `listings` table (from SETUP.md)
- [ ] Verify table policies are set correctly
- [ ] Test inserting a record manually

### 2. Configure Site
- [ ] Edit `js/config.js` with your Supabase credentials
- [ ] Open `index.html` locally in browser
- [ ] Verify no console errors
- [ ] Create a test listing via `list-item.html`
- [ ] Verify listing appears on homepage and browse page
- [ ] Test WhatsApp link (should open WhatsApp with pre-filled message)
- [ ] Test on mobile device

### 3. Seed Database (Optional but Recommended)
- [ ] Open `seed-database.html` in browser
- [ ] Click "Seed Database" button
- [ ] Verify 10 sample listings appear
- [ ] Browse categories to check variety
- [ ] Test search functionality

### 4. GitHub Setup
- [ ] Create GitHub repo: `beaconmarket`
- [ ] Initialize git in project folder
- [ ] Add all files
- [ ] Commit with message "Initial BeaconMarket MVP"
- [ ] Push to GitHub
- [ ] Enable GitHub Pages (Settings → Pages)
- [ ] Select branch: `main`, folder: `/ (root)`
- [ ] Wait 2-3 minutes for deployment
- [ ] Visit: https://brandonkz.github.io/beaconmarket/
- [ ] Verify site works live

### 5. Domain Setup (Optional)
- [ ] Buy `beaconmarket.co.za` (or similar)
- [ ] Add CNAME record: `www` → `brandonkz.github.io`
- [ ] Configure custom domain in GitHub Pages settings
- [ ] Enable "Enforce HTTPS"
- [ ] Wait for DNS propagation (5-60 minutes)
- [ ] Test: https://www.beaconmarket.co.za

## Launch Week

### Day 1: Soft Launch
- [ ] Clear sample/test listings
- [ ] Add 3-5 real listings (your own or friends')
- [ ] Share link with 5 close friends for feedback
- [ ] Fix any bugs they find
- [ ] Optimize based on feedback

### Day 2: Community Launch
- [ ] Post in Fresnaye Community WhatsApp group
  - Message template:
    ```
    👋 Hi everyone!
    
    I built a simple marketplace for our community to share holiday homes, rent equipment, and find services.
    
    🏖️ Check it out: [link]
    
    List something in 2 mins - no fees, no hassle. Just WhatsApp contact.
    
    Would love your feedback! 🙏
    ```
- [ ] Monitor for new listings
- [ ] Respond to questions/feedback

### Day 3-7: Expand Reach
- [ ] Post to Facebook: "Plett Residents" group
- [ ] Post to Facebook: "Beacon Isle Community" group
- [ ] Email estate managers with link
- [ ] Ask early listers to share with friends
- [ ] Monitor analytics (Supabase dashboard)

## Week 2: Gather Feedback

### Metrics to Track
- [ ] Total listings: ___
- [ ] Page views (GitHub Insights): ___
- [ ] WhatsApp contacts made: ___
- [ ] User feedback: (list below)

### Questions to Ask Early Users
- [ ] Was it easy to create a listing?
- [ ] Did you get contacted via WhatsApp?
- [ ] What features are missing?
- [ ] Would you pay R50/month for a featured listing?
- [ ] What categories should we add?

### Common Issues to Watch For
- [ ] Spam listings → implement manual approval
- [ ] Bad contact info → add verification step
- [ ] Low-quality images → add photo upload feature
- [ ] Duplicate listings → add "edit" functionality

## Month 1: Iterate & Improve

### Priority Improvements
- [ ] Add user accounts (so people can edit their listings)
- [ ] Add photo upload (Supabase Storage)
- [ ] Add email notifications for new listings
- [ ] Add simple admin panel to moderate listings
- [ ] Add analytics dashboard (views, contacts, etc.)

### Marketing Push
- [ ] Reach out to 3-5 other Plett estates
- [ ] Offer to set up their estate marketplace
- [ ] Post success stories ("Jane rented out her holiday home!")
- [ ] Create Instagram account (@beaconmarket)
- [ ] Run small Facebook ad (R200-500 budget)

## Month 2: Monetization

### Featured Listings Launch
- [ ] Build "featured" flag in database
- [ ] Add Stripe/PayFast payment integration
- [ ] Offer first 10 featured listings for free (trial)
- [ ] Email existing listers about upgrade option
- [ ] Target: 20 paid featured listings @ R50/month = R1,000/month

### TradeSafe Escrow (Optional)
- [ ] Integrate TradeSafe API for holiday homes >R5,000
- [ ] Add "Book with Protection" button
- [ ] Test with 1-2 pilot bookings
- [ ] Calculate commission structure (5-10%)

## Long-Term Vision

### Month 3-6
- [ ] Expand to 3-5 other estates
- [ ] Build WhatsApp bot for auto-posting
- [ ] Add calendar availability for holiday homes
- [ ] Launch premium subscription: R200/month unlimited featured
- [ ] Target: R5-10k/month revenue

### Month 6-12
- [ ] Expand to Knysna, Hermanus estates
- [ ] Hire part-time community manager
- [ ] Add reviews & ratings system
- [ ] Partner with local estate agents
- [ ] Target: R20-30k/month revenue

### Year 2+
- [ ] Become THE estate marketplace for SA
- [ ] White-label solution for estate managers
- [ ] Mobile app (React Native)
- [ ] Target: R50-100k/month revenue

---

## Quick Reference

**Supabase Dashboard**: https://supabase.com/dashboard  
**GitHub Repo**: https://github.com/brandonkz/beaconmarket  
**Live Site**: https://brandonkz.github.io/beaconmarket/  
**Custom Domain**: https://www.beaconmarket.co.za (when set up)

**Support**: hello@beaconmarket.co.za | WhatsApp: 082 886 8631

---

**Last Updated**: 2026-02-20  
**Status**: Ready to launch 🚀
