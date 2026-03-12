# 🔧 Fixing API Search Issues on Vercel

## Problem
Search queries return no results because the BountyLab API key isn't configured on Vercel.

## Solution: Add Environment Variable to Vercel

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/reinas-projects-f8477ee1/bountylab
2. Click **Settings** (top menu)
3. Select **Environment Variables** (left sidebar)

### Step 2: Add the API Key
1. Click **Add New**
2. Fill in:
   - **Name**: `VITE_BOUNTYLAB_API_KEY`
   - **Value**: `gMolfPrnxsbeTBJQGfydcAilRkNYHwyHxBalifYjITEaUJieRABauFICmIAYGtbj`
   - **Envs**: Select all (Production, Preview, Development)
3. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Select **Redeploy**
4. Confirm

### Step 4: Test
1. Visit https://bountylab.vercel.app
2. Go to Developer Search
3. Try searching for a developer (e.g., "javascript", "python")
4. Results should now appear!

## Expected Results After Setup
✅ Developer search works  
✅ Developer profiles load  
✅ Repository discovery works  
✅ All API calls succeed  

## Troubleshooting

**Still no results?**
1. Check browser console (F12 → Console tab)
2. Look for error messages
3. Verify API key was set correctly
4. Check that redeploy finished

**Check API Key Status**
1. Open browser DevTools (F12)
2. Network tab
3. Try a search
4. Look for API requests to `api.bountylab.dev`
5. Check response status and body

## Time to Deploy
- Environment variable added: ~1 minute
- Vercel redeploy: ~2-3 minutes
- Total: ~5 minutes
