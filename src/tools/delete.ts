import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { del, hasApiKey } from '../client.js';

export function registerDeleteTool(server: McpServer) {
  server.registerTool(
    'prismism_delete',
    {
      title: 'Delete Prismism Artifact',
      description: 'Permanently delete an artifact. This cannot be undone.',
      inputSchema: {
        id: z.string().describe('Artifact ID to delete'),
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

      const result = await del(`/v1/artifacts/${id}`);

      if (!result.ok) {
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              ok: true,
              data: { deleted: true, id },
              _hints: ['Artifact permanently deleted.'],
            }),
          },
        ],
      };
    }
  );
}
