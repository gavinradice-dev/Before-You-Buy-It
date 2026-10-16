/* Before You Buy — settings. Everything here is free to set up. */
window.BYB_CONFIG = {
  beta: true,               // true = every tool unlocked (no paywall). Keep true while it's free.
  api: '/api/claude',       // AI features. Add GEMINI_API_KEY (free) in Cloudflare Pages > Settings > Variables and Secrets.
  formspree: '',            // free feedback inbox: sign up at formspree.io, create a form, paste its ID (the part after /f/)
  adminKey: '',             // secret word; open yoursite.pages.dev/?admin=THAT_WORD for Admin
  contactEmail: '',         // shown on Privacy, Terms and How we make money pages
  cloudflareAnalyticsToken: '', // free visitor counts: Cloudflare dashboard > Web Analytics > Add a site > copy the token
  sampleListings: true,     // the 378 sample homes are for private testing. Set false before a public launch.

  // Payments (later). Stripe is free to set up; it only takes a small fee when someone pays.
  stripe: { pro_monthly: '', pro_yearly: '', super_monthly: '', super_yearly: '' },

  // Affiliate programs are free to join. Paste IDs once approved.
  aff: {
    amazonTag: '', bookingAid: '',
    wrap: { 'bestbuy.com': '', 'walmart.com': '', 'expedia.com': '', 'viator.com': '', 'abt.com': '', 'tripadvisor.com': '' }
  }
};
