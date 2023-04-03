const asyncHandler = require('express-async-handler');
const axios = require('axios');
const validator = require('validator');
const YoutubeVideo = require('../models/youtubeVideo_model');
const youtubeApiKey = process.env.YOUTUBE_API_KEY;
const youtubeApiKey2 = process.env.YOUTUBE_API_KEY2;
const youtubeApiURL = 'https://www.googleapis.com/youtube/v3';
const ytDuration = require('youtube-duration');


// @desc    Get playlist data by id
// @route   GET /search/playlist/:playlistId
// @access  Public
const getPlayListById = asyncHandler(async (req, res) => {
    const getPlaylistUrl = `${youtubeApiURL}/playlistItems?key=${youtubeApiKey}&maxResults=50&part=snippet&playlistId=${req.params.playlistId}`;
    const response = await axios.get(getPlaylistUrl);
    console.log(`response: ${response.data.items}`);
    if(response.status == 200){
        const items = response.data.items;
        var searchResults = [];
        var videoIds = '';
        for(var item of items){
            videoIds += item.snippet.resourceId.videoId + ','; 
            let clipUrl = `https://youtu.be/${item.snippet.resourceId.videoId}`;
            let clipImg = item.snippet.thumbnails.medium.url;
            let clip = YoutubeVideo({
                url: clipUrl,
                thumbnail: clipImg,
                title: item.snippet.title,
                channel: item.snippet.channelTitle,
                duration: 'PT30M20S'
            });
            searchResults.push(clip);
        }
        // videoIds = videoIds.slice(0,-1);
        // console.log(`videoIds: ${videoIds}`);
        // searchResults = await getDurationByIds(videoIds, searchResults);
        // console.log(`searchresult: ${searchResults}`);

        if(searchResults.length > 0){
            res.status(200).json(searchResults);
        }else {
            res.status(404);
            throw new Error('No result');
        }
    }

});


// @desc    search video on YouTube
// @route   GET /search?search_query=<search_keyword>
// @access  Public
const searchVid = asyncHandler(async (req, res) => {
    const searchQuery = req.query.search_query;
    const searchUrl = `${youtubeApiURL}/search?key=${youtubeApiKey2}&maxResults=25&order=relevance&type=video,playlist&part=snippet&q=${searchQuery}`;
    const response = await axios.get(searchUrl);
    console.log(`response1: ${response.data.items}`);
    if(response.status == 200){
        const items = response.data.items;
        var searchResults = [];
        var videoIds = '';
        for(var item of items){
            let clipUrl = '';
            if(item.id.kind.includes('video')){
                videoIds += item.id.videoId + ','; 
                clipUrl = `https://youtu.be/${item.id.videoId}`;
            }else if(item.id.kind.includes('playlist')){
                clipUrl = `playlist/${item.id.playlistId}`;
            }
            let clipImg = item.snippet.thumbnails.medium.url;
            let clip = YoutubeVideo({
                url: clipUrl,
                thumbnail: clipImg,
                title: item.snippet.title,
                channel: item.snippet.channelTitle,
                duration: null
            });
            searchResults.push(clip);
        }
        // videoIds = videoIds.slice(0,-1);
        // console.log(`videoIds: ${videoIds}`);
        // searchResults = await getDurationByIds(videoIds, searchResults);
        // // https://www.googleapis.com/youtube/v3/videos?id=<videoId1,videoId2>&part=contentDetails&key={YOUR_API_KEY}
        console.log(`searchresult: ${searchResults}`);
        
        if(searchResults.length > 0){
            res.status(200).json(searchResults);
        }else {
            res.status(404);
            throw new Error('No result');
        }
        // res.status(200).json(searchResults);
    }
});

async function getDurationByIds(Ids, videoList) {
    const mapVideoList = new Map(videoList.map((obj) => [(obj.url).substr((obj.url).lastIndexOf('/')+1), obj]));
    const durationUrl = `${youtubeApiURL}/videos?id=${Ids}&part=contentDetails&key=${youtubeApiKey2}`;
    const response = await axios.get(durationUrl);
    if(response.status == 200){
        const items = response.data.items;
        for(var item of items){
            // let clip = mapVideoList.get(item.id);
            if (mapVideoList.get(item.id)){
                mapVideoList.get(item.id).duration = item.contentDetails.duration;
            }
        }
        const updatedSearchResult = Array.from(mapVideoList.values());
        return updatedSearchResult;
    }else {
        return [];
    }
}
module.exports = { searchVid, getPlayListById }