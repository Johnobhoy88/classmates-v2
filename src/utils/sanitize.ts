/**
 * Classmates — HighlandAI
 * © 2026 John McMillan (HighlandAI). All rights reserved.
 * Licensed under CC BY-NC 4.0
 * https://github.com/Johnobhoy88/classmates-v2
 */

/**
 * Strip dangerous HTML: <script> tags, on* event handlers, javascript: URLs.
 * Allows safe markup (SVG shapes, paragraphs, spans, etc.) to pass through.
 */
export function sanitizeHtml(html: string): string {
  return html
    // Remove <script>...</script> blocks (incl. multiline)
    .replace(/<script[\s>][\s\S]*?<\/script>/gi, '')
    // Remove standalone <script> tags
    .replace(/<\/?script[^>]*>/gi, '')
    // Remove on* event attributes (onclick, onerror, onload, etc.)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Remove javascript: URLs
    .replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '')
    .replace(/src\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '');
}
