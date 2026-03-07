import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { patch, hasApiKey } from '../client.js';

export function registerUpdateTool(server: McpServer) {
  server.registerTool(
    'prismism_update',
    {
      title: 'Update Prismism Artifact',
      description: 'Update settings for an existing artifact — title, download permissions, or password protection.',
      inputSchema: {
        id: z.string().describe('Artifact ID'),
        title: z.string().optional().describe('New display title'),
        allowDownload: z.boolean().optional().describe('Allow viewers to download the file'),
        password: z.string().optional().describe('Set a password to protect the artifact (empty string to remove)'),
      },
    },
    async ({ id, title, allowDownload, password }) => {
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

      const updates: Record<string, unknown> = {};
      if (title !== undefined) updates.title = title;
      if (allowDownload !== undefined) updates.allowDownload = allowDownload;
      if (password !== undefined) updates.password = password;

      if (Object.keys(updates).length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                ok: false,
                error: { code: 'NO_UPDATES', message: 'No fields to update' },
                _hints: ['Provide at least one field to update: title, allowDownload, or password.'],
              }),
            },
          ],
          isError: true,
        };
      }

      const result = await patch(`/v1/artifacts/${id}`, updates);

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
