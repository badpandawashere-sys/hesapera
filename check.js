const https = require('https');
https.get('https://www.haremaltin.com/altin-fiyatlari', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const urls = Array.from(data.matchAll(/[\"\'](\/ajax\/[^\"\']+)[\"\']/g)).map(m => m[1]);
    const wss = Array.from(data.matchAll(/(wss:\/\/[^\"\']+)/g)).map(m => m[1]);
    console.log('Ajax URLs:', [...new Set(urls)]);
    console.log('WS URLs:', [...new Set(wss)]);
  });
});
