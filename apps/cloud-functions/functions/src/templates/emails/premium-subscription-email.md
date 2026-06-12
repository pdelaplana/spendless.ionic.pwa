# Premium Subscription - Thank You Email

## Subject Line
Thanks for upgrading to Premium, {firstName}!

## Email Body

Hey {firstName},

Thank you so much for upgrading to Spendless Premium!

Your support means the world to me and directly helps keep Spendless growing and improving. I'm committed to making this app the best it can be, and subscribers like you make that possible.

If you ever have questions, feedback, or just want to chat about the app, don't hesitate to reach out. I read every email.

Thanks again for believing in Spendless.

Cheers,
{founderName}
Founder, Spendless

---

## Email Footer

© {currentYear} Spendless. All rights reserved.

[Privacy Policy] | [Terms of Service] | [Help Center]

---

## Technical Notes

### Variables to Replace
- `{firstName}` - User's first name from profile
- `{founderName}` - Founder's name (e.g., "Patrick")
- `{currentYear}` - Current year

### Send Timing
- Trigger: When customer.subscription.created webhook is received from Stripe
- Sent for subscriptions with status 'active' or 'trialing'
- Delivery: Use transactional email service (Mailgun)

### Styling Guidelines
- Use Spendless brand colors
- Mobile-responsive design
- Keep formatting simple and accessible
