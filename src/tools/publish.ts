import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { upload, patch, hasApiKey } from '../client.js';

/** Infer content type from filename extension */
function inferContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    html: 'text/html',
    htm: 'text/html',
    md: 'text/markdown',
    markdown: 'text/markdown',
    txt: 'text/plain',
    json: 'application/json',
    csv: 'text/csv',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    mp4: 'video/mp4',
  };
  return map[ext || ''] || 'application/octet-stream';
}

export function registerPublishTool(server: McpServer) {
  server.registerTool(
    'prismism_publish',
    {
      title: 'Publish File to Prismism',
      description:
        'Upload a file and get a shareable, tracked link. Supports PDF, HTML, Markdown, images (PNG/JPG/GIF/SVG/WebP), and video (MP4). Send content as plain text (default) or base64 for binary files.',
      inputSchema: {
        content: z.string().describe('File content — plain text (default) or base64-encoded for binary files'),
        filename: z.string().describe('Filename with extension, e.g. "report.pdf" or "chart.png"'),
        encoding: z.enum(['utf8', 'base64']).default('utf8').describe('Content encoding — use "base64" for binary files like PDFs, images, or video'),
        contentType: z.string().optional().describe('MIME type — auto-detected from filename if not provided'),
        title: z.string().optional().describe('Display title for the artifact'),
      },
    },
    async ({ content, filename, encoding, contentType, title }) => {
      if (!hasApiKey()) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                ok: false,
                error: { code: 'NO_API_KEY', message: 'API key required to publish' },
                _hints: ['Set PRISMISM_API_KEY in your MCP config. Use prismism_register to create an account.'],
              }),
            },
          ],
          isError: true,
        };
      }

      // Convert content to Buffer
      const buffer = encoding === 'base64' ? Buffer.from(content, 'base64') : Buffer.from(content, 'utf-8');

      const resolvedContentType = contentType || inferContentType(filename);

      const result = await upload<{
        id: string;
        shortId: string;
        title: string;
        url: string;
        filename: string;
        mimeType: string;
        size: number;
        allowDownload: boolean;
        createdAt: string;
      }>('/v1/artifacts', buffer, filename, resolvedContentType);

      if (!result.ok) {
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          isError: true,
        };
      }

      // If a title was provided, update the artifact
      if (title && result.data?.id) {
        await patch(`/v1/artifacts/${result.data.id}`, { title });
        if (result.data) {
          result.data.title = title;
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              ok: true,
              data: result.data,
              _hints: result.data?.url ? [`Shareable link: ${result.data.url}`] : undefined,
            }),
          },
        ],
      };
    }
  );
}
