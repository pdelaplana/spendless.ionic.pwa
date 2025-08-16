# Context7 MCP Server Setup Guide

Context7 is an MCP (Model Context Protocol) server that provides up-to-date documentation and code examples directly from official sources, injecting them into your AI assistant's context.

## What is Context7?

Context7 solves the problem of AI models using outdated training data by fetching the latest documentation and code examples straight from official sources and integrating them directly into the context window.

## Prerequisites

- Node.js version 18.0.0 or higher
- NPM or compatible package manager

## Installation Options

### Option 1: Using Smithery CLI (Recommended)

```bash
npx -y @smithery/cli@latest install @upstash/context7-mcp --client <CLIENT_NAME> --key <YOUR_SMITHERY_KEY>
```

### Option 2: Manual Configuration

#### For Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "Context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

#### For Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

#### For Windsurf

```json
{
  "mcpServers": {
    "context7": {
      "serverUrl": "https://mcp.context7.com/sse"
    }
  }
}
```

### Option 3: Alternative Runtimes

#### Using Bun

```json
{
  "mcpServers": {
    "context7": {
      "command": "bunx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

#### Using Deno

```json
{
  "mcpServers": {
    "context7": {
      "command": "deno",
      "args": ["run", "--allow-net", "npm:@upstash/context7-mcp"]
    }
  }
}
```

## Project-Specific Setup

For this Spendless project, I've created a configuration file at `.context7-mcp.json` with the recommended settings.

### Testing Context7

You can test the Context7 installation using:

```bash
npm run test-context7
```

## Usage

To use Context7 in your prompts with AI assistants:

1. Simply include "use context7" in your prompt
2. The server will automatically fetch current documentation for the libraries mentioned in your request
3. This documentation will be injected into the context for more accurate, up-to-date responses

### Example Usage

```
Create a React component for form validation using react-hook-form. use context7
```

This will fetch the latest react-hook-form documentation and provide current examples.

### Supported Libraries

Context7 supports documentation for popular libraries including:
- React
- Next.js
- Firebase
- Ionic
- TanStack Query (React Query)
- And many more...

## Benefits for This Project

Given that Spendless uses modern libraries like:
- React 19
- Ionic Framework
- Firebase
- TanStack Query
- Vite

Context7 will ensure you always get the most current documentation and examples when working with these technologies, avoiding deprecated patterns and outdated API usage.

## Troubleshooting

### Common Issues

1. **Node.js Version**: Ensure you're running Node.js 18.0.0 or higher
2. **Network Access**: Context7 requires internet access to fetch documentation
3. **Permissions**: For Deno runtime, ensure `--allow-net` permission is granted

### Testing Connection

If you encounter issues, test the MCP server directly:

```bash
npx -y @upstash/context7-mcp@latest
```

This should start the server and confirm it's working properly.

## Configuration Files

- `.context7-mcp.json` - Project-specific MCP configuration
- This file contains the server configuration for easy setup with different clients

## Next Steps

After setup:
1. Restart your AI coding assistant
2. Test Context7 by including "use context7" in your prompts
3. Verify that you're getting current documentation for your project's libraries