const asyncHandler = require('express-async-handler');
const axios = require('axios');
const validator = require('validator');
const youtubeApiKey = process.env.YOUTUBE_API_KEY;
const youtubeApiURL = 'https://www.googleapis.com/youtube/v3';

// @desc    search video on YouTube
// @route   GET /search
// @access  Private
const searchVid = asyncHandler(async (req, res) => {
    const searchQuery = req.query.search_query;
    const url = `${youtubeApiURL}/search?key=${youtubeApiKey}&type=video&part=snippet&q=${searchQuery}`;
    const response = await axios.get(url);
    res.statusCode(200).res.json(response.data.items);
});

module.exports = { searchVid }