#!/bin/bash

echo "🚀 StyleSensei Deployment Script"
echo "================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🌐 Deploying to Vercel..."
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your Vercel URL (e.g., https://your-app.vercel.app)"
echo "2. Update background.js line 4 with your URL"
echo "3. Set OPENAI_API_KEY in Vercel dashboard"
echo "4. Test the extension!"
echo ""
echo "🎉 Your extension is now production-ready!" 