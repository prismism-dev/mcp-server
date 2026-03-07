import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { get, hasApiKey } from '../client.js';

export function registerListTool(server: McpServer) {
  server.registerTool(
    'prismism_list',
    {
      title: 'List Prismism Artifacts',
      description: 'List your published artifacts with pagination.',
      inputSchema: {
        page: z.number().int().min(1).default(1).describe('Page number (starts at 1)'),
        limit: z.number().int().min(1).max(100).default(20).describe('Items per page (max 100)'),
      },
    },
    async ({ page, limit }) => {
      if (!hasApiKey()) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                ok: false,
                error: { code: 'NO_API_KEY', message: 'API key required' },
                _hints: ['Set PRISMISM_API_KEY in your MCP config.'],
              }),
            },
          ],
          isError: true,
        };
      }

      const result = await get(`/v1/artifacts?page=${page}&limit=${limit}`);

      if (!result.ok) {
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text', text: JSON.stringify({ ok: true, data: result.data }) }],
      };
    }
  );
}
