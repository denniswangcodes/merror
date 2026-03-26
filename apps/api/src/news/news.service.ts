import { Injectable } from '@nestjs/common';

export type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
};

const RSS_URL = 'https://www.goodnewsnetwork.org/feed/';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_ITEMS = 5;

// Basic HTML entity decode for common entities in RSS titles
function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#8230;/g, '\u2026')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

@Injectable()
export class NewsService {
  private cache: { items: NewsItem[]; fetchedAt: number } | null = null;

  async getPositiveNews(): Promise<NewsItem[]> {
    if (this.cache && Date.now() - this.cache.fetchedAt < CACHE_TTL_MS) {
      return this.cache.items;
    }

    try {
      const res = await fetch(RSS_URL, {
        headers: { 'User-Agent': 'merror-app/1.0 (positive news sidebar)' },
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);

      const xml = await res.text();
      const items = this.parseRss(xml).slice(0, MAX_ITEMS);

      if (items.length > 0) {
        this.cache = { items, fetchedAt: Date.now() };
      }

      return items;
    } catch {
      // Return stale cache if available, otherwise empty array
      return this.cache?.items ?? [];
    }
  }

  private parseRss(xml: string): NewsItem[] {
    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const title = decodeEntities(this.extractCdata(block, 'title'));
      const link = this.extractLink(block);
      const pubDate = this.extractCdata(block, 'pubDate');
      const rawDesc = this.extractCdata(block, 'description');
      const description = this.excerptFromHtml(rawDesc);

      if (title && link) {
        items.push({ title, link, pubDate, description });
      }
    }

    return items;
  }

  /** Extracts text content, stripping CDATA wrappers if present */
  private extractCdata(block: string, tag: string): string {
    const m = block.match(
      new RegExp(`<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))\\s*<\\/${tag}>`, 'i'),
    );
    if (!m) return '';
    return (m[1] ?? m[2] ?? '').trim();
  }

  /** Strip HTML tags and return first ~200 chars of plain text */
  private excerptFromHtml(html: string): string {
    if (!html) return '';
    const plain = decodeEntities(
      html
        .replace(/<[^>]+>/g, ' ')  // strip tags
        .replace(/\s+/g, ' ')       // collapse whitespace
        .trim(),
    );
    if (plain.length <= 200) return plain;
    // Cut at last word boundary before 200
    const cut = plain.slice(0, 200);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > 120 ? cut.slice(0, lastSpace) : cut) + '...';
  }

  /** RSS <link> is unusual — it's often a bare text node between tags */
  private extractLink(block: string): string {
    // Try <link>...</link>
    const plain = this.extractCdata(block, 'link');
    if (plain && plain.startsWith('http')) return plain;

    // Fallback: <guid isPermaLink="true">...</guid>
    const guid = block.match(/<guid[^>]*isPermaLink="true"[^>]*>([\s\S]*?)<\/guid>/i);
    if (guid) return guid[1].trim();

    // Fallback: any <guid>
    const anyGuid = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
    if (anyGuid && anyGuid[1].trim().startsWith('http')) return anyGuid[1].trim();

    return '';
  }
}
