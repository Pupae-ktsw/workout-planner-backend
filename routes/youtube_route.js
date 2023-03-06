const express = require('express');
const router = express.Router();
const validateToken = require('../middleware/auth');
const {
    searchVid,
} = require('../controllers/youtube_controller');

// router.route('/').get(getUsers);
// router.route('/signup').post(signupUser);
// router.route('/login').post(loginUser);
router.route('/').get(searchVid);
//                     .put(updateUser)
//                     .delete(deleteUser);
module.exports = router;