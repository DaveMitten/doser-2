# Quick Test Guide - Email Verification Fix

## 🚀 Quick Start (2 Minutes)

### Step 1: Update Supabase Email Template

1. Go to: https://supabase.com/dashboard → Your Project → Authentication → Email Templates
2. Find "Confirm signup" template
3. Change this line:
   ```
   {{ .SiteURL }}/auth/verify?token_hash={{ .TokenHash }}&type=email
   ```
   To:
   ```
   {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email
   ```
4. Click **Save**

### Step 2: Test Signup

1. Open your app with **DevTools Console open** (F12)
2. Sign up with a test email
3. Check your email
4. Click the verification link
5. Watch the console logs

### Step 3: Verify Success

You should see:

```
✅ OTP verification successful!
Extraction method used: direct (or wrapped-q for Gmail)
✅ Session found
✅ DASHBOARD MOUNTED
User: { id: '...', email: '...' }
```

And you should:

- ✅ Land on /dashboard
- ✅ See your sessions/dashboard content
- ✅ Stay logged in after refresh

## 🐛 If Something's Wrong

### Problem: Still landing on landing page

**Check:**

1. Did you update the Supabase email template?
2. Did you click the NEW verification link (after template update)?
3. Check console for errors

### Problem: "Invalid verification link"

**Solution:**

- Link expired (they expire after 1-24 hours)
- Sign up again or resend verification email

### Problem: "No session found" in console

**Check:**

1. Console logs - look for "OTP verification failed"
2. DevTools → Application → Cookies - check for `sb-*` cookies
3. Try a different browser (clear cache first)

## 📊 What to Document

After testing, note:

| Email Provider | Worked? | Extraction Method Used | Notes |
| -------------- | ------- | ---------------------- | ----- |
| Gmail          | ✅/❌   | (check console)        |       |
| Outlook        | ✅/❌   | (check console)        |       |
| Yahoo          | ✅/❌   | (check console)        |       |
| Other          | ✅/❌   | (check console)        |       |

## 🔍 Console Logs to Watch For

### Successful Flow:

```
=== AUTH CALLBACK DEBUG ===
Full URL: ...
Universal extraction result: { token_hash: '...', type: 'email', source: 'direct' }
✅ OTP verification successful!
Redirecting to: .../dashboard

=== AUTH CONTEXT: Getting initial session ===
✅ Session found

=== DASHBOARD MOUNTED ===
User: { id: '...', email: '...' }
```

### Failed Flow:

```
❌ OTP verification failed: ...
⚠️ No session found
User: No user
```

## ⚡ Different Email Providers

### Gmail

- May wrap URL in `?q=` parameter
- Universal extractor handles this
- Console will show `source: 'wrapped-q'`

### Outlook/Hotmail

- May use SafeLinks transformation
- Universal extractor handles this
- Console will show extraction method

### Other Email Clients

- Should work with direct parameters
- Console will show `source: 'direct'`
- If fails, document URL structure for debugging

## ✅ Success Checklist

After clicking verification link:

- [ ] Land on /dashboard (not landing page)
- [ ] See "Session created" in console
- [ ] See user email in dashboard
- [ ] Supabase cookies present (DevTools → Application → Cookies)
- [ ] Stay logged in after page refresh
- [ ] Can access /calculator, /sessions, etc.

## 📝 If You Find Issues

1. **Copy console logs** - All of them, especially errors
2. **Note email provider** - Gmail, Outlook, etc.
3. **Check cookies** - DevTools → Application → Cookies → Look for `sb-*`
4. **Try different browser** - Does it work in incognito?
5. **Check Supabase template** - Was it saved correctly?

## 🎯 Expected Outcome

**Before fix:**

- Click email link → Land on landing page → Not logged in ❌

**After fix:**

- Click email link → Land on dashboard → Logged in ✅

---

**Need more details?** See `EMAIL_VERIFICATION_FIX_SUMMARY.md`

**Having issues?** Check `EMAIL_VERIFICATION_UPDATE_GUIDE.md` for troubleshooting

