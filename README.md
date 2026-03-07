# @prismism/mcp-server

MCP server for [Prismism](https://prismism.dev) — shareable links for any file.

Upload files and get tracked, shareable links directly from Claude Desktop, Cursor, Copilot, Windsurf, or any MCP-compatible agent.

## Quick Start

### 1. Get an API key

Create a free account at [prismism.dev](https://prismism.dev) or use the `prismism_register` tool after setup.

### 2. Add to your MCP config

#### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "prismism": {
      "command": "npx",
      "args": ["@prismism/mcp-server"],
      "env": {
        "PRISMISM_API_KEY": "pal_your_key_here"
      }
    }
  }
}
```

#### Cursor

Edit `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "prismism": {
      "command": "npx",
      "args": ["@prismism/mcp-server"],
      "env": {
        "PRISMISM_API_KEY": "pal_your_key_here"
      }
    }
  }
}
```

#### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "prismism": {
      "command": "npx",
      "args": ["@prismism/mcp-server"],
      "env": {
        "PRISMISM_API_KEY": "pal_your_key_here"
      }
    }
  }
}
```

### 3. Verify it works

Ask your agent: **"Use the prismism_health tool to check the connection"**

## Tools

| Tool | Description |
|------|-------------|
| `prismism_health` | Check connection and auth status |
| `prismism_register` | Create account + get API key (one-time) |
| `prismism_publish` | Upload a file and get a shareable link |
| `prismism_list` | List your artifacts |
| `prismism_get` | Get artifact details + analytics |
| `prismism_update` | Update title, download permissions, password |
| `prismism_delete` | Permanently delete an artifact |
| `prismism_account` | Get account info, plan, and usage |

### Publishing files

```
"Publish this report as a shareable link"
```

The `prismism_publish` tool accepts:

- **Plain text** (default): HTML, Markdown, CSV, JSON, etc.
- **Base64**: Set `encoding: "base64"` for binary files like PDFs, images, and video

Supported formats: PDF, HTML, Markdown, Images (PNG/JPG/GIF/SVG/WebP), Video (MP4).

### Registering without a key

If you don't have an API key yet, the `prismism_register` tool can create an account:

```
"Register me on Prismism with my email"
```

It returns the API key once — the agent will help you save it to your config.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PRISMISM_API_KEY` | For most tools | — | Your Prismism API key |
| `PRISMISM_BASE_URL` | No | `https://prismism.dev` | API base URL |

## Response Format

All tools return a consistent JSON envelope:

```json
{
  "ok": true,
  "data": { ... },
  "_hints": ["Actionable guidance for the agent"]
}
```

On error:

```json
{
  "ok": false,
  "error": { "code": "STORAGE_LIMIT", "message": "..." },
  "_hints": ["Upgrade at https://prismism.dev/settings/billing"]
}
```

## Requirements

- Node.js 18 or later
- npm or npx

## License

MIT

## Links

- [Prismism](https://prismism.dev) — Shareable links for any file
- [API Documentation](https://prismism.dev/docs)
- [OpenAPI Spec](https://prismism.dev/openapi.yaml)
