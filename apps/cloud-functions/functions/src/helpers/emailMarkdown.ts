/**
 * Email-safe styles for markdown elements
 * Uses inline styles since many email clients don't support <style> tags
 */
const EMAIL_STYLES = {
  h1: 'color: #8B5FBF; margin-top: 32px; margin-bottom: 16px; font-size: 28px; font-weight: 600;',
  h2: 'color: #8B5FBF; margin-top: 32px; margin-bottom: 16px; font-size: 24px; font-weight: 600;',
  h3: 'color: #8B5FBF; margin-top: 24px; margin-bottom: 12px; font-size: 18px; font-weight: 600;',
  p: 'margin: 12px 0; line-height: 1.6; color: #333;',
  ul: 'margin: 16px 0; padding-left: 24px; line-height: 1.6;',
  ol: 'margin: 16px 0; padding-left: 24px; line-height: 1.6;',
  li: 'margin-bottom: 8px;',
  hr: 'border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;',
  strong: 'font-weight: 600;',
  em: 'font-style: italic;',
  container:
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, "Helvetica Neue", Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;',
};

// Lazy-loaded marked instance
// biome-ignore lint/suspicious/noExplicitAny: Dynamic import requires any type
let markedInstance: any = null;

/**
 * Get or initialize the marked instance with custom renderer
 */
async function getMarked() {
  if (!markedInstance) {
    const markedModule = await import('marked');
    const { marked } = markedModule;

    // Configure marked with custom renderer that adds inline styles for email compatibility
    marked.use({
      renderer: {
        heading({ tokens, depth }) {
          const text = this.parser.parseInline(tokens);
          const style = EMAIL_STYLES[`h${depth}` as 'h1' | 'h2' | 'h3'] || EMAIL_STYLES.h3;
          return `<h${depth} style="${style}">${text}</h${depth}>\n`;
        },
        paragraph({ tokens }) {
          const text = this.parser.parseInline(tokens);
          return `<p style="${EMAIL_STYLES.p}">${text}</p>\n`;
        },
        list({ items, ordered }) {
          const tag = ordered ? 'ol' : 'ul';
          const style = ordered ? EMAIL_STYLES.ol : EMAIL_STYLES.ul;
          const body = items.map((item) => this.listitem(item)).join('');
          return `<${tag} style="${style}">\n${body}</${tag}>\n`;
        },
        listitem({ tokens }) {
          const text = this.parser.parse(tokens);
          return `<li style="${EMAIL_STYLES.li}">${text}</li>\n`;
        },
        hr() {
          return `<hr style="${EMAIL_STYLES.hr}">\n`;
        },
        strong({ tokens }) {
          const text = this.parser.parseInline(tokens);
          return `<strong style="${EMAIL_STYLES.strong}">${text}</strong>`;
        },
        em({ tokens }) {
          const text = this.parser.parseInline(tokens);
          return `<em style="${EMAIL_STYLES.em}">${text}</em>`;
        },
      },
    });

    markedInstance = marked;
  }

  return markedInstance;
}

/**
 * Converts markdown to email-safe HTML with inline styles
 * @param markdown - Markdown string to convert
 * @returns HTML string with inline styles suitable for emails
 */
export async function convertMarkdownToHtml(markdown: string): Promise<string> {
  const marked = await getMarked();
  const html = (await marked.parse(markdown)) as string;

  // Wrap in a styled container for consistent email appearance
  return `<div style="${EMAIL_STYLES.container}">${html}</div>`;
}

/**
 * Replaces template variables with actual values
 * @param template - Template string with {variable} placeholders
 * @param variables - Object mapping variable names to values
 * @returns Processed template with variables replaced
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>,
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}
