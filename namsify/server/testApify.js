import fetch from 'node-fetch';

async function testApify() {
  const url = 'https://api.apify.com/v2/actor-runs/DFdA9gMaKB8thCIBU?token=apify_api_fx7GkEGmpe7gMDTOrweZqg6HvdhTSc3ATL24';
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(data.data.actId);
  } catch (e) {
    console.error(e);
  }
}
testApify();
