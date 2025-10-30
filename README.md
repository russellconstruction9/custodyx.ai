<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1D26HOGc1ggl-_57RTG5OxkHOHqSrvbTb

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file and set the `GEMINI_API_KEY` environment variable:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Run the app:
   `npm run dev`

## Deploy to Vercel

This project is configured for Vercel deployment.

### Quick Deploy

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in [Vercel](https://vercel.com)
3. Configure environment variables:
   - Go to your project settings in Vercel
   - Navigate to "Environment Variables"
   - Add `GEMINI_API_KEY` with your Gemini API key value
4. Deploy! Vercel will automatically detect the Vite framework and use the `vercel.json` configuration

### Manual Deploy via CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Set environment variables:
   ```bash
   vercel env add GEMINI_API_KEY
   ```

### Environment Variables

Make sure to set the following environment variable in Vercel:
- `GEMINI_API_KEY` - Your Google Gemini API key

The app will automatically use these environment variables in production builds.

## Supabase (optional)

If you want to use Supabase for database, auth, or storage, add the following environment variables to your local `.env.local` (do NOT commit secrets):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Notes:
- Vite requires client-facing env vars to start with the `VITE_` prefix.
- Example usage in the app: `import { supabase } from './services/supabaseClient';`
- Install the SDK with `npm install @supabase/supabase-js`.

See `.env.example` in the repo for placeholders.
