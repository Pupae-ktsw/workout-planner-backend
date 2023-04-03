const mongoose = require('mongoose');

const youtubeVidSchema = mongoose.Schema({
    url: {type: String, require: true, unique: true},
    thumbnail: {type: String, require: true},
    title: {type: String, require: true},
    channel: {type: String, require: true},
    duration: {type: String, require: true}
});

module.exports = mongoose.model('YoutubeVideo', youtubeVidSchema);