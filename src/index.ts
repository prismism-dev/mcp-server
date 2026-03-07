#!/usr/bin/env node

/**
 * Prismism MCP Server
 *
 * Exposes Prismism's API as native MCP tools for Claude Desktop, Cursor, Copilot, Windsurf,
 * and every MCP-compatible agent.
 *
 * Usage:
 *   npx @prismism/mcp-server
 *
 * Configuration:
 *   PRISMISM_API_KEY  — Your Prismism API key (required for most tools)
 *   PRISMISM_BASE_URL — API base URL (default: https://prismism.dev)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerHealthTool } from './tools/health.js';
import { registerRegisterTool } from './tools/register.js';
import { registerPublishTool } from './tools/publish.js';
import { registerListTool } from './tools/list.js';
import { registerGetTool } from './tools/get.js';
import { registerUpdateTool } from './tools/update.js';
import { registerDeleteTool } from './tools/delete.js';
import { registerAccountTool } from './tools/account.js';

const server = new McpServer({
  name: 'prismism',
  version: '0.1.0',
});

// Register all tools
registerHealthTool(server);
registerRegisterTool(server);
registerPublishTool(server);
registerListTool(server);
registerGetTool(server);
registerUpdateTool(server);
registerDeleteTool(server);
registerAccountTool(server);

// Connect via stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
