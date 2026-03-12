# BountyLab Recruiter - Vercel Deployment Guide

## Pre-Deployment Checklist

✅ **Build Configuration**
- `vercel.json` configured with proper build settings
- `vite.config.ts` optimized for production
- `package.json` with correct build and dev scripts

✅ **Environment Variables**
- Created `.env.example` with required keys
- Set up Vercel environment secrets reference

✅ **Project Structure**
- TypeScript strict mode configured
- Tailwind CSS with PostCSS build pipeline
- React Router v6 configured

## Deployment Steps

### 1. Connect to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy the project
vercel
```

### 2. Set Environment Variables in Vercel Dashboard

Go to your Vercel project settings and add:
- **Key**: `VITE_BOUNTYLAB_API_KEY`
- **Value**: Your BountyLab API key from https://bountylab.dev/api/keys

### 3. Configure Custom Domain (Optional)

In Vercel Dashboard → Settings → Domains, add your custom domain pointing to the project.

### 4. Monitor Build & Performance

- View build logs in Vercel dashboard
- Check CLI output for any build issues
- Monitor performance metrics post-deployment

## Important Notes

- **Framework**: Vite (React)
- **Build Output**: `dist/` directory
- **Runtime**: Node.js (auto-detected by Vercel)
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Dev Command**: `npm run dev`

## API Configuration

The app uses the BountyLab API endpoint configured via the `VITE_BOUNTYLAB_API_KEY` environment variable. This key is referenced in the API client at `src/api/bountylabClient.ts`.

## Troubleshooting

### Build Fails
- Check that `.vercelignore` isn't excluding necessary files
- Verify all dependencies are listed in `package.json`
- Ensure Node.js version compatibility (v18+ recommended)

### Environment Variables Not Loading
- Confirm `VITE_` prefix is used (Vite requirement)
- Redeploy after updating environment variables in Vercel
- Check that keys are set in Vercel Dashboard, not `.env` file

### Performance Issues
- Enable Vercel Analytics in dashboard
- Check bundle size with `npm run build` locally
- Optimize images and large assets

## Post-Deployment

1. Test all features in production
2. Monitor error logs in Vercel dashboard
3. Set up analytics and monitoring
4. Keep dependencies updated
