const mongoose = require('mongoose');

const youtubeVidSchema = mongoose.Schema({
    videoURL: {
        type: String,
        required: true
    },
    thumbnail: String,
    name: String,
    channel: String,
    duration: Number
});

module.exports = mongoose.model('YoutubeVideo', youtubeVidSchema);