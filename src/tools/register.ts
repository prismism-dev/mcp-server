import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { post, getBaseUrl } from '../client.js';

export function registerRegisterTool(server: McpServer) {
  server.registerTool(
    'prismism_register',
    {
      title: 'Register Prismism Account',
      description:
        'Create a new Prismism account and get an API key. This is a one-time setup tool. The API key is returned once and cannot be retrieved again — save it to your MCP config immediately.',
      inputSchema: {
        name: z.string().describe('Your name'),
        email: z.string().email().describe('Your email address — use a real email you can access'),
      },
    },
    async ({ name, email }) => {
      const result = await post<{
        apiKey?: string;
        user?: { id: string; name: string; email: string };
        docs?: string;
        agentSkills?: string;
      }>('/v1/auth/register', { name, email });

      if (!result.ok) {
        const hints = result._hints || [];

        // Special handling for existing accounts
        if (result.error?.code === 'EMAIL_EXISTS') {
          hints.push(
            'This email is already registered. Create a new API key at https://prismism.dev/settings/api-keys and add it to your MCP config.'
          );
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ ok: false, error: result.error, _hints: hints }),
            },
          ],
          isError: true,
        };
      }

      const baseUrl = getBaseUrl();
      const configSnippet = result.data?.apiKey
        ? `\n\nAdd this to your MCP config:\n{\n  "mcpServers": {\n    "prismism": {\n      "command": "npx",\n      "args": ["@prismism/mcp-server"],\n      "env": {\n        "PRISMISM_API_KEY": "${result.data.apiKey}"\n      }\n    }\n  }\n}`
        : '';

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              ok: true,
              data: result.data,
              _hints: [
                `Save this API key now — it cannot be retrieved again.${configSnippet}`,
                result.data?.docs ? `API docs: ${result.data.docs}` : null,
                result.data?.agentSkills ? `Agent skills: ${result.data.agentSkills}` : null,
              ].filter(Boolean),
            }),
          },
        ],
      };
    }
  );
}
