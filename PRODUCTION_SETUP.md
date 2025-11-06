# Production Configuration Steps

## 1. Update Your Netlify App URL

In your `.env` file, I've updated:
```
VITE_APP_URL=https://your-app-name.netlify.app
```

**Replace `your-app-name` with your actual Netlify site name.**

To find your Netlify URL:
1. Go to your Netlify dashboard
2. Find your site name (it will be something like `amazing-site-12345.netlify.app`)
3. Update the `.env` file with the correct URL

## 2. Update Supabase Project Settings

You need to update your Supabase project to work with your production URL:

### In Supabase Dashboard:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `zvbhasmodaiykhxrutsr`
3. Go to **Authentication** → **Settings**

### Update Redirect URLs:
In the "Redirect URLs" section, add:
```
https://your-app-name.netlify.app/auth/callback
https://your-app-name.netlify.app
```

### Update Site URL:
Set the Site URL to:
```
https://your-app-name.netlify.app
```

### Update Additional Redirect URLs:
If there's an "Additional redirect URLs" field, add:
```
https://your-app-name.netlify.app/**
```

### Update Allowed Origins (if present):
Add:
```
https://your-app-name.netlify.app
```

## 3. Remove Localhost (Optional)
If you want to completely disconnect from localhost, remove these from Supabase:
- `http://localhost:3000`
- `http://localhost:3000/auth/callback`

## 4. Deploy and Test

After updating both your `.env` file and Supabase settings:

1. **Commit and push your changes:**
```bash
git add .env lib/supabase.ts
git commit -m "feat: Configure for production deployment"
git push origin main
```

2. **Your Netlify site will auto-deploy**

3. **Test the login flow** on your production site

## 5. If You Need to Test Locally Later

If you want to test locally again in the future:
1. Temporarily change `VITE_APP_URL` back to `http://localhost:3000`
2. Add `http://localhost:3000` back to Supabase settings
3. Restart your dev server with `npm run dev`

## Current Status
✅ Updated `.env` to use production URL  
✅ Updated OAuth redirect to use environment variable  
⏳ **Next: Update Supabase dashboard settings (manual step)**  
⏳ **Then: Deploy and test**