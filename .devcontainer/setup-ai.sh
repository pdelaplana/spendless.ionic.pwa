#!/bin/bash
echo "⚡ Finalizing AI Agent Trust & Plugins..."

# --- GEMINI TRUST & EXTENSIONS ---
mkdir -p ~/.gemini
# Automatically trust the /workspaces directory (where all repos live)
echo '{"/workspaces": "TRUST_PARENT"}' > ~/.gemini/trustedFolders.json
# Disable the trust prompt globally for this environment
echo '{"security": {"folderTrust": {"enabled": false}}}' > ~/.gemini/settings.json

# Install extensions using the --yolo flag to skip confirmation
gemini extensions install https://github.com/gemini-cli-extensions/conductor --yolo
gemini extensions install https://github.com/gemini-cli-extensions/firebase --yolo

# --- CLAUDE TRUST & SUPERPOWERS ---
mkdir -p ~/.claude
# Inject settings to enable Superpowers and allow tool execution
cat > ~/.claude/settings.json <<EOF
{
  "marketplaces": {
    "superpowers-marketplace": "https://github.com/obra/superpowers-marketplace"
  },
  "enabledPlugins": {
    "superpowers@superpowers-marketplace": true
  },
  "permissions": {
    "dangerouslySkipPermissions": true
  }
}
EOF

echo "✅ All AI agents are now trusted and ready!"