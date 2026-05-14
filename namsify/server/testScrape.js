import fetch from 'node-fetch';

async function testScrape(q) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  
  const match = html.match(/var ytInitialData = ({.*?});<\/script>/);
  if (!match) {
    console.log("No ytInitialData found");
    return;
  }
  
  const data = JSON.parse(match[1]);
  const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
  if (!contents) {
    console.log("No contents found");
    return;
  }
  
  const itemSection = contents.find(c => c.itemSectionRenderer)?.itemSectionRenderer?.contents;
  if (!itemSection) {
    console.log("No itemSection found");
    return;
  }
  
  const results = itemSection
    .filter(item => item.videoRenderer)
    .map(item => {
      const v = item.videoRenderer;
      return {
        id: v.videoId,
        title: v.title?.runs?.[0]?.text,
        artist: v.ownerText?.runs?.[0]?.text,
        cover: v.thumbnail?.thumbnails?.[0]?.url
      };
    });
    
  console.log(results);
}

testScrape('trending pop music 2024');
