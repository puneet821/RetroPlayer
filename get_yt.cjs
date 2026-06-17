const https = require('https');

https.get('https://www.youtube.com/playlist?list=PLJ3jVfetwpl675zbx16Ka7ZGZTfV083Vb', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = [...data.matchAll(/\"videoId\":\"([a-zA-Z0-9_-]{11})\"/g)];
    const uniqueIds = [...new Set(matches.map(m => m[1]))];
    console.log(uniqueIds);
  });
});
