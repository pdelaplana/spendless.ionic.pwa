#!/bin/bash
set -e # Exit on error

echo "🚀 Starting Hybrid Dev Environment Setup..."

# 1. Update system and install base dependencies
sudo apt-get update
sudo apt-get install -y curl git jq

# 2. Install Ionic and Firebase CLIs
echo "📦 Installing Ionic and Firebase..."
npm install -g @ionic/cli firebase-tools

# 3. Install Gemini CLI
echo "♊ Installing Gemini CLI..."
npm install -g @google/gemini-cli

# 4. Install Claude Code CLI
echo "🤖 Installing Claude Code..."
curl -fsSL https://claude.ai/install.sh | bash

# 5. Ensure scripts in the devcontainer are executable
chmod +x .devcontainer/setup-ai.s