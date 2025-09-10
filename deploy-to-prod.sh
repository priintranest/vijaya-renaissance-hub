#!/bin/bash
# Quick deployment script for VVF Waitlist frontend

echo "🚀 Starting deployment to production..."

# Build the project
echo "📦 Building production version..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Upload to server
echo "📤 Uploading files to production server..."
scp -r ./dist/* root@thevvf.org:/var/www/thevvf.org/

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your site should now be updated at https://thevvf.org"
    echo ""
    echo "Next steps:"
    echo "1. Test the waitlist form submission"
    echo "2. Check the admin panel at https://thevvf.org/admin"
    echo "3. Verify API calls in browser console"
else
    echo "❌ Deployment failed!"
    echo "Please check your connection to the server"
fi
