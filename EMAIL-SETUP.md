# Making the confirmation email reliable and branded

The login "invalid" errors were all one thing: `Email not confirmed`. People
registered, the confirmation email never arrived (Supabase's built-in email is
rate-limited and lands in spam), so they could never log in.

The code side is done. These are the three dashboard steps only you can do —
they take about ten minutes and turn the email from unreliable to reliable.

Your Supabase project: https://supabase.com/dashboard/project/dbjiwurgbaymfoafxfvu

---

## Step 1 — Connect Resend so emails actually arrive (the important one)

Supabase's built-in email sends only a few messages per hour and usually lands
in spam. Resend is free (100 emails/day, 3,000/month) and delivers properly.

1. Create a free account at https://resend.com
2. In Resend, go to **API Keys** and create one. Copy it.
3. To send from a nice address you would add and verify a domain in Resend, but
   until you own `sprachstufe.com` you can use Resend's shared sender for testing.
4. In Supabase: **Project Settings → Authentication → SMTP Settings** (or
   **Authentication → Emails → SMTP**), turn on **Custom SMTP** and enter:
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: the Resend API key you copied
   - Sender email: `onboarding@resend.dev` (until your own domain is verified)
   - Sender name: `Sprachstufe`
5. Save.

## Step 2 — Paste the branded email

1. In Supabase: **Authentication → Emails → Templates → Confirm signup**
2. Open `supabase-email-confirm.html` from this project, copy all of it.
3. Paste it into the **Message body (HTML)** box, replacing what's there.
4. Set the **Subject** to: `Confirm your email — Sprachstufe`
5. Save.

## Step 3 — Point the confirmation links at the live site

If this is wrong, clicking the link in the email goes nowhere.

1. In Supabase: **Authentication → URL Configuration**
2. **Site URL**: `https://deutschmeister-five.vercel.app`
   (change this to `https://sprachstufe.com` once you buy and connect the domain)
3. **Redirect URLs** — add both, one per line:
   - `https://deutschmeister-five.vercel.app/**`
   - `http://localhost:3000/**`
4. Save.

---

## How it works after this

1. Someone registers → sees "Confirm your email" and gets the branded email.
2. They click "Confirm my email" → land on their dashboard, logged in.
3. Every day after, they just log in with email + password. No email needed again.

If someone still can't find the email, the login page now has a **Resend
confirmation email** button, and the message is clear about checking spam.

## The everyday-login promise

Confirmation is a one-time thing. Once an account is confirmed, that person logs
in with the same email and password forever — no email, no link, no friction.
That is already how the code works; these three steps just make the one-time
confirmation email reliable.
