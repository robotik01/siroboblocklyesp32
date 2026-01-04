#!/bin/bash

echo "🤖 Sirobo Deployment Script"
echo "==========================="
echo ""

# Check if repository exists by trying to access it
echo "📋 Step 1: Checking if GitHub repository exists..."
if git ls-remote https://github.com/robotik01/siroboblocklyesp32.git &>/dev/null; then
    echo "✅ Repository exists!"
else
    echo "❌ Repository not found!"
    echo ""
    echo "Please create the repository first:"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: siroboblocklyesp32"
    echo "3. Description: Sirobo - Educational Robot Platform with Blockly & ESP32"
    echo "4. Make it Public (for GitHub Pages)"
    echo "5. Do NOT initialize with README, .gitignore, or license"
    echo "6. Click 'Create repository'"
    echo ""
    echo "After creating the repo, run this script again!"
    exit 1
fi

echo ""
echo "🚀 Step 2: Pushing code to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Code pushed successfully!"
else
    echo "❌ Push failed! You may need authentication."
    echo ""
    echo "If you need authentication, use:"
    echo "  git push https://YOUR_USERNAME:YOUR_TOKEN@github.com/robotik01/siroboblocklyesp32.git"
    echo ""
    echo "To create a token:"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Generate new token (classic)"
    echo "3. Select scopes: repo, workflow"
    echo "4. Copy the token and use it in the command above"
    exit 1
fi

echo ""
echo "⚙️ Step 3: Enabling GitHub Pages..."
echo "Please complete these steps manually:"
echo "1. Go to: https://github.com/robotik01/siroboblocklyesp32/settings/pages"
echo "2. Under 'Build and deployment':"
echo "   - Source: GitHub Actions"
echo "3. Go to: https://github.com/robotik01/siroboblocklyesp32/actions"
echo "4. Enable workflows if prompted"
echo ""

echo "⏳ Step 4: Waiting for deployment..."
echo "The GitHub Actions workflow will automatically:"
echo "  1. Build the website (npm run build)"
echo "  2. Deploy to GitHub Pages"
echo "  3. Make it available at: https://robotik01.github.io/siroboblocklyesp32/"
echo ""
echo "Check deployment status at:"
echo "  https://github.com/robotik01/siroboblocklyesp32/actions"
echo ""
echo "Website will be live in 2-3 minutes! 🎉"
