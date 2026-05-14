import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
config();

const app = express();
app.use(cors());
app.use(express.json());

const YT_KEY = process.env.YOUTUBE_API_KEY;
const BACKUP_YT_KEY = 'AIzaSyBWUYo_2bIl3Cu392QYjrB7zFjSfDfMXwc';

// Helper: map YouTube API items to song objects
function mapItems(items = []) {
  return items
    .filter(item => item.id?.videoId)
    .map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      cover:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        '',
    }));
}

async function scrapeYouTube(q) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  
  const match = html.match(/var ytInitialData = ({.*?});<\/script>/);
  if (!match) return [];
  
  try {
    const data = JSON.parse(match[1]);
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
    if (!contents) return [];
    
    const itemSection = contents.find(c => c.itemSectionRenderer)?.itemSectionRenderer?.contents;
    if (!itemSection) return [];
    
    return itemSection
      .filter(item => item.videoRenderer)
      .map(item => {
        const v = item.videoRenderer;
        return {
          id: v.videoId,
          title: v.title?.runs?.[0]?.text,
          artist: v.ownerText?.runs?.[0]?.text,
          cover: v.thumbnail?.thumbnails?.[0]?.url?.split('?')[0] // remove query params for cleaner URLs
        };
      }).slice(0, 20); // match API limits
  } catch (e) {
    console.error('Scraping parse error:', e.message);
    return [];
  }
}

// Search endpoint
app.get('/api/youtube/search', async (req, res) => {
  const { q = 'trending pop music 2024' } = req.query;
  try {
    const fetchWithKey = async (key) => {
      if (!key) return { error: { message: 'No API key provided' } };
      const url = new URL('https://www.googleapis.com/youtube/v3/search');
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('type', 'video');
      url.searchParams.set('videoCategoryId', '10');
      url.searchParams.set('maxResults', '20');
      url.searchParams.set('q', q);
      url.searchParams.set('key', key);
      const response = await fetch(url.toString());
      return await response.json();
    };

    let data = await fetchWithKey(YT_KEY);

    if (data.error || !data.items) {
      console.warn('Primary API Search failed, trying backup key...');
      data = await fetchWithKey(BACKUP_YT_KEY);
    }

    if (data.error || !data.items) {
      console.warn('Backup API failed, falling back to scraper...');
      const scraped = await scrapeYouTube(q);
      if (scraped.length > 0) return res.json(scraped);
      return res.status(400).json({ error: data.error?.message || 'API failed and scraper returned no results' });
    }
    res.json(mapItems(data.items));
  } catch (e) {
    console.error('Search error, trying scraper fallback:', e.message);
    try {
      const scraped = await scrapeYouTube(q);
      if (scraped.length > 0) return res.json(scraped);
    } catch (scrapeErr) {}
    res.status(500).json({ error: e.message });
  }
});

// Suggestions endpoint
app.get('/api/youtube/suggestions', async (req, res) => {
  const { title = '', artist = '' } = req.query;
  const q = `${title} ${artist} mix playlist`.trim();
  try {
    const fetchWithKey = async (key) => {
      if (!key) return { error: { message: 'No API key provided' } };
      const url = new URL('https://www.googleapis.com/youtube/v3/search');
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('type', 'video');
      url.searchParams.set('videoCategoryId', '10');
      url.searchParams.set('maxResults', '10');
      url.searchParams.set('q', q);
      url.searchParams.set('key', key);
      const response = await fetch(url.toString());
      return await response.json();
    };

    let data = await fetchWithKey(YT_KEY);

    if (data.error || !data.items) {
      console.warn('Primary API Suggestions failed, trying backup key...');
      data = await fetchWithKey(BACKUP_YT_KEY);
    }

    if (data.error || !data.items) {
      console.warn('Backup API failed, falling back to scraper...');
      const scraped = await scrapeYouTube(q);
      if (scraped.length > 0) return res.json(scraped);
      return res.status(400).json({ error: data.error?.message || 'API failed and scraper returned no results' });
    }
    res.json(mapItems(data.items));
  } catch (e) {
    console.error('Suggestions error, trying scraper fallback:', e.message);
    try {
      const scraped = await scrapeYouTube(q);
      if (scraped.length > 0) return res.json(scraped);
    } catch (scrapeErr) {}
    res.status(500).json({ error: e.message });
  }
});

// ─── Lyrics endpoint (LRCLIB — free, no key) ───
// Cleans YouTube titles like "Song Name (Official Video) [Lyrics]" → "Song Name"
function cleanTitle(raw) {
  return raw
    .replace(/\s*[\(\[][^\)\]]*(?:official|video|lyrics|audio|hd|hq|ft\.?|feat\.?|music|mv|visualizer|remaster|live)[^\)\]]*[\)\]]/gi, '')
    .replace(/\s*[\|–—\-]\s*.*$/i, '') // strip trailing dash/pipe segments
    .replace(/[""]/g, '')
    .trim();
}

function cleanArtist(raw) {
  return raw
    .replace(/vevo$/i, '')
    .replace(/\s*[-–—]\s*topic$/i, '')
    .replace(/official$/i, '')
    .trim();
}

app.get('/api/lyrics', async (req, res) => {
  const { title = '', artist = '' } = req.query;
  const cleanedTitle = cleanTitle(title);
  const cleanedArtist = cleanArtist(artist);

  try {
    // Try search first (more forgiving with fuzzy matching)
    const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanedTitle + ' ' + cleanedArtist)}`;
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'namsify/1.0 (https://namsify.app)' },
    });
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      // Find best match: prefer one with syncedLyrics, then plainLyrics
      const withSynced = data.find(d => d.syncedLyrics);
      const withPlain = data.find(d => d.plainLyrics);
      const best = withSynced || withPlain || data[0];

      return res.json({
        found: true,
        trackName: best.trackName || best.name,
        artistName: best.artistName,
        syncedLyrics: best.syncedLyrics || null,
        plainLyrics: best.plainLyrics || null,
      });
    }

    // Nothing found
    res.json({ found: false, syncedLyrics: null, plainLyrics: null });
  } catch (e) {
    console.error('Lyrics error:', e.message);
    res.json({ found: false, syncedLyrics: null, plainLyrics: null });
  }
});

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'namsify-server' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n✦ Namsify Server running at http://localhost:${PORT}\n`);
});
