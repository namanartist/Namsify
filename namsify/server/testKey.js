import fetch from 'node-fetch';

async function testKey() {
  const url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=2&q=nama&key=AIzaSyBWUYo_2bIl3Cu392QYjrB7zFjSfDfMXwc';
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}
testKey();
