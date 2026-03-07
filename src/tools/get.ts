import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { get, hasApiKey } from '../client.js';

export function registerGetTool(server: McpServer) {
  server.registerTool(
    'prismism_get',
    {
      title: 'Get Prismism Artifact',
      description: 'Get details and analytics for a specific artifact by ID.',
      inputSchema: {
        id: z.string().describe('Artifact ID'),
      },
    },
    async ({ id }) => {
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

      const result = await get(`/v1/artifacts/${id}`);

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
