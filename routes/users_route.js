const express = require('express');
const router = express.Router();
const validateToken = require('../middleware/auth');
const {
    getUsers,
    getLoginUser,
    loginUser,
    signupUser,
    updateUser,
    deleteUser
} = require('../controllers/user_controller');

// router.route('/').get(getUsers);
router.route('/signup').post(signupUser);
router.route('/login').post(loginUser);
router.route('/', validateToken).get(getLoginUser)
                    .put(updateUser)
                    .delete(deleteUser);

module.exports = router;