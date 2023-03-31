const asyncHandler = require('express-async-handler');
const axios = require('axios');
const validator = require('validator');
const YoutubeVideo = require('../models/youtubeVideo_model');
const youtubeApiKey = process.env.YOUTUBE_API_KEY;
const youtubeApiURL = 'https://www.googleapis.com/youtube/v3';
const ytDuration = require('youtube-duration');

// @desc    search video on YouTube
// @route   GET /search
// @access  Private
const searchVid = asyncHandler(async (req, res) => {
    const searchQuery = req.query.search_query;
    const searchUrl = `${youtubeApiURL}/search?key=${youtubeApiKey}&type=video,playlist&part=snippet&q=${searchQuery}`;
    const response = await axios.get(searchUrl);
    if(response.status == 200){
        const items = response.data.items;
        const searchResults = [];
        var videoIds = '';
        for(var item of items){
            videoIds += item.id.videoId + ',';
            let clipUrl = `https://youtu.be/${item.id.videoId}`;
            let clipImg = `https://i3.ytimg.com/vi/${item.id.videoId}/maxresdefault.jpg`
            let clip = YoutubeVideo({
                url: clipUrl,
                thumbnail: clipImg,
                title: item.snippet.title,
                channel: item.snippet.channelTitle,
                duration: 1800
            });
            searchResults.push(clip);
        }
        // videoIds = videoIds.slice(0,-1);
        // console.log(`videoIds: ${videoIds}`);
        // // https://www.googleapis.com/youtube/v3/videos?id=<videoId1,videoId2>&part=contentDetails&key={YOUR_API_KEY}
        // const durationUrl = `${youtubeApiURL}/videos?id=${videoIds}&part=contentDetails&key=${youtubeApiKey}`;
        // console.log(`durationUrl: ${durationUrl}`);
        // const responseDuration = await axios.get(durationUrl);
        // if (responseDuration.status == 200){

        // }
        res.status(200).json(searchResults);
    }
    
});

module.exports = { searchVid }