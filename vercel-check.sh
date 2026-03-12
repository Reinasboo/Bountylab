#!/bin/bash

# BountyLab Recruiter - Vercel Deployment Checklist
# Run this to verify everything is ready for Vercel

echo "🚀 BountyLab Recruiter - Vercel Deployment Checklist"
echo "=================================================="
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
node --version
echo ""

# Check npm version
echo "✓ Checking npm version..."
npm --version
echo ""

# Check required config files
echo "✓ Checking configuration files..."
for file in vercel.json .vercelignore vite.config.ts package.json tsconfig.json; do
    if [ -f "$file" ]; then
        echo "  ✓ $file exists"
    else
        echo "  ✗ $file missing!"
    fi
done
echo ""

# Check environment setup
echo "✓ Checking environment configuration..."
if [ -f ".env" ] && grep -q "VITE_BOUNTYLAB_API_KEY" .env; then
    echo "  ✓ .env file with API key exists (local testing)"
else
    echo "  ⚠ .env not configured (required for local testing)"
fi

if [ -f ".env.example" ] && grep -q "VITE_BOUNTYLAB_API_KEY" .env.example; then
    echo "  ✓ .env.example template exists"
else
    echo "  ✗ .env.example missing"
fi
echo ""

# Build test
echo "✓ Running production build..."
npm run build
if [ $? -eq 0 ]; then
    echo "  ✓ Build successful!"
else
    echo "  ✗ Build failed!"
    exit 1
fi
echo ""

# Bundle size
echo "✓ Build output summary:"
if [ -d "dist" ]; then
    du -sh dist
    echo "  Files in dist:"
    ls -lh dist/assets/ | tail -5
fi
echo ""

echo "=================================================="
echo "✅ Ready for Vercel deployment!"
echo ""
echo "Next steps:"
echo "1. Install Vercel CLI: npm i -g vercel"
echo "2. Deploy: vercel --prod"
echo "3. Set VITE_BOUNTYLAB_API_KEY in Vercel Dashboard"
echo ""
echo "For detailed guide, see DEPLOYMENT.md"
