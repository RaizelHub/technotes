import { Note } from '../types';

// Convert simple HTML elements from TipTap into clean Markdown
export function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let md = html;

  // Headings
  md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');

  // Pre / Code blocks (Cisco commands)
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```text\n$1\n```\n\n');

  // Inline code
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Bold & Italic & Underline
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_');

  // Task Items
  md = md.replace(/<li[^>]*data-type="taskItem"[^>]*data-checked="true"[^>]*>(.*?)<\/li>/gi, '- [x] $1\n');
  md = md.replace(/<li[^>]*data-type="taskItem"[^>]*data-checked="false"[^>]*>(.*?)<\/li>/gi, '- [ ] $1\n');

  // Standard lists
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<ul[^>]*>/gi, '');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '');
  md = md.replace(/<\/ol>/gi, '\n');

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n\n');

  // Paragraphs & Breaks
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n\n');

  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)\n\n');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)\n\n');

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  md = md
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');

  return md.trim();
}

// Download Note as Markdown (.md)
export function downloadMarkdown(note: Note) {
  const content = `# ${note.title || 'Untitled Note'}

Category: ${note.category?.name || 'Uncategorized'}
Tags: ${note.tags ? note.tags.split(',').map((t) => '#' + t.trim()).join(' ') : 'None'}
Updated: ${new Date(note.updatedAt).toLocaleString()}

---

${htmlToMarkdown(note.content)}
`;

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeFilename = (note.title || 'untitled-note')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  link.href = url;
  link.download = `${safeFilename}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Trigger browser print for Clean PDF
export function printCleanDocument() {
  window.print();
}

// Trigger SQLite database backup download
export function downloadDatabaseBackup() {
  window.open('/api/backup', '_blank');
}
