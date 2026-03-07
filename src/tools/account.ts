import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { get, hasApiKey } from '../client.js';

export function registerAccountTool(server: McpServer) {
  server.registerTool(
    'prismism_account',
    {
      title: 'Prismism Account Info',
      description: 'Get your account details — name, email, plan, and storage usage.',
    },
    async () => {
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

      const result = await get('/v1/account');

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
