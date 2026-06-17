const https = require('https');

https.get('https://www.youtube.com/playlist?list=PLJ3jVfetwpl675zbx16Ka7ZGZTfV083Vb', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const match = data.match(/var ytInitialData = (\{.*?\});/);
        if (match && match[1]) {
            const parsed = JSON.parse(match[1]);
            const tabs = parsed.contents.twoColumnBrowseResultsRenderer.tabs;
            const tab = tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;
            
            const songs = tab.filter(c => c.playlistVideoRenderer).map(c => {
                const vid = c.playlistVideoRenderer;
                return {
                    id: vid.videoId,
                    title: vid.title.runs[0].text,
                    thumbnail: vid.thumbnail.thumbnails[vid.thumbnail.thumbnails.length - 1].url
                };
            });
            console.log(JSON.stringify(songs, null, 2));
        } else {
            console.log("Could not find ytInitialData");
        }
    });
});
