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
    const url = `${youtubeApiURL}/search?key=${youtubeApiKey}&type=video&part=snippet&q=${searchQuery}`;
    const response = await axios.get(url);
    if(response.status == 200){
        
        const items = response.data.items;
        console.log(`body: ${items}`);
        const searchResults = [];
        for(var item of items){
            console.log(`item: ${item}`);
            let clipUrl = `https://youtu.be/${item.id.videoId}`;
            console.log(`clipURL: ${clipUrl}`);
            let clipImg = `https://i3.ytimg.com/vi/${item.id.videoId}/maxresdefault.jpg`
            console.log(`clipImg: ${clipImg}`);
            let clip = YoutubeVideo({
                url: clipUrl,
                thumbnail: clipImg,
                title: item.snippet.title,
                channel: item.snippet.channelTitle,
                duration: 1800
            });
            searchResults.push(clip);

        }

        console.log(`search: ${searchResults}`);

        res.status(200).json(searchResults);
    }
    
});

module.exports = { searchVid }