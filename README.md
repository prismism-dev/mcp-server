# @prismism/mcp-server

MCP server for [Prismism](https://prismism.dev) — **DocSend for AI agents.**

Upload any file → get a tracked, shareable link. PDF, HTML, Markdown, images, video. View analytics, email capture, webhooks.

## Quick Start

### 1. Get an API key

Create a free account at [prismism.dev](https://prismism.dev) or use the `prismism_register` tool after setup.

### 2. Connect your client

#### Hosted endpoint (recommended)

No install needed — connect directly to the Prismism API:

**Claude Code**

```bash
claude mcp add prismism --transport http https://prismism.dev/mcp \
  --header "x-api-key: pal_your_key_here"
```

**Claude Desktop** — edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "prismism": {
      "url": "https://prismism.dev/mcp",
      "headers": {
        "x-api-key": "pal_your_key_here"
      }
    }
  }
}
```

**Cursor** — edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "prismism": {
      "url": "https://prismism.dev/mcp",
      "headers": {
        "x-api-key": "pal_your_key_here"
      }
    }
  }
}
```

**Windsurf** — edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "prismism": {
      "serverUrl": "https://prismism.dev/mcp",
      "headers": {
        "x-api-key": "pal_your_key_here"
      }
    }
  }
}
```

**VS Code** — edit `.vscode/mcp.json`:

```json
{
  "servers": {
    "prismism": {
      "type": "http",
      "url": "https://prismism.dev/mcp",
      "headers": {
        "x-api-key": "pal_your_key_here"
      }
    }
  }
}
```

#### Local (stdio) — alternative

Run via npx if you prefer local transport:

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

| Tool | Auth required | Description |
|------|:---:|-------------|
| `prismism_health` | — | Check connection and auth status |
| `prismism_register` | — | Create account + get API key (one-time) |
| `prismism_publish` | ✓ | Upload a file and get a shareable link |
| `prismism_list` | ✓ | List your artifacts with pagination |
| `prismism_get` | ✓ | Get artifact details + analytics |
| `prismism_update` | ✓ | Update title, download settings, password |
| `prismism_delete` | ✓ | Permanently delete an artifact |
| `prismism_account` | ✓ | Get account info, plan, and usage |

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

- **Hosted endpoint**: No requirements — works with any MCP client
- **Local (stdio)**: Node.js 18+, npm or npx

## License

MIT

## Links

- [Prismism](https://prismism.dev) — Shareable links for any file
- [API Documentation](https://prismism.dev/docs)
- [OpenAPI Spec](https://prismism.dev/openapi.yaml)
