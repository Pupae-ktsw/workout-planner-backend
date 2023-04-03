const express = require('express');
const router = express.Router();
const validateToken = require('../middleware/auth');
const {
    searchVid,
    getPlayListById,
} = require('../controllers/youtube_controller');

// router.route('/').get(getUsers);
// router.route('/signup').post(signupUser);
// router.route('/login').post(loginUser);
router.route('/').get(searchVid);
router.route('/playlist/:playlistId').get(getPlayListById);
//                     .put(updateUser)
//                     .delete(deleteUser);
module.exports = router;