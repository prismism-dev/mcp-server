import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { get, getBaseUrl, hasApiKey } from '../client.js';

const VERSION = '0.1.0';

export function registerHealthTool(server: McpServer) {
  server.registerTool(
    'prismism_health',
    {
      title: 'Prismism Health Check',
      description:
        'Verify that the Prismism MCP server is running and the API key is configured correctly. Call this first to confirm your setup works before doing anything else.',
    },
    async () => {
      const baseUrl = getBaseUrl();
      const hasKey = hasApiKey();

      if (!hasKey) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                ok: true,
                data: {
                  baseUrl,
                  authenticated: false,
                  version: VERSION,
                },
                _hints: [
                  'No API key configured. Set PRISMISM_API_KEY in your MCP config to authenticate.',
                  'Register at https://prismism.dev or use the prismism_register tool to create an account.',
                ],
              }),
            },
          ],
        };
      }

      // Verify the key works by hitting the account endpoint
      const result = await get('/v1/account');

      if (!result.ok) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                ok: false,
                data: {
                  baseUrl,
                  authenticated: false,
                  version: VERSION,
                },
                error: result.error,
                _hints: result._hints || [
                  'API key is set but authentication failed. Check that your key is correct.',
                ],
              }),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              ok: true,
              data: {
                baseUrl,
                authenticated: true,
                version: VERSION,
                account: result.data,
              },
            }),
          },
        ],
      };
    }
  );
}
