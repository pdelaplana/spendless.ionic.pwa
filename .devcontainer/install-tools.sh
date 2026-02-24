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

# 4. Install Gemini Extensions (Conductor + Firebase)
echo "🔌 Adding Gemini Extensions..."
# Conductor for context-driven dev and Firebase for specialized MCP tools
gemini extensions install https://github.com/gemini-cli-extensions/conductor --auto-update
gemini extensions install https://github.com/gemini-cli-extensions/firebase --auto-update

# 5. Install Claude Code CLI
echo "🤖 Installing Claude Code..."
curl -fsSL https://claude.ai/install.sh | bash

# 6. Pre-configure Claude Superpowers Plugin
# We automate the marketplace registration so you only have to run the final install
echo "🦸 Pre-configuring Claude Superpowers..."
mkdir -p ~/.claude/
cat > ~/.claude/plugins.json <<EOF
{
  "plugins": {
    "superpowers": {
      "type": "github",
      "owner": "obra",
      "repo": "superpowers"
    }
  },
  "marketplaces": {
    "obra/superpowers-marketplace": {
      "type": "github",
      "owner": "obra",
      "repo": "superpowers-marketplace"
    }
  }
}
EOF

# 7. Finalize Shell Path
echo "PATH=\$PATH:\$(npm config get prefix)/bin" >> ~/.zshrc
export PATH=$PATH:$(npm config get prefix)/bin

echo "✅ Setup Complete!"
echo "Next Steps:"
echo "1. Type 'claude' then run: /plugin install superpowers@obra/superpowers-marketplace"
echo "2. Type 'gemini' then run: /conductor:setup"
