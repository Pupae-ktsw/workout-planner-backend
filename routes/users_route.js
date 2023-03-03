const express = require('express');
const router = express.Router();
const validateToken = require('../middleware/auth');
const {
    getUsers,
    getThisUser,
    loginUser,
    signupUser,
    updateUser,
    deleteUser
} = require('../controllers/user_controller');
const { validate } = require('../models/user_model');

// router.route('/').get(getUsers);
router.route('/signup').post(signupUser);
router.route('/login').post(loginUser);
router.route('/:id', validateToken).get(getThisUser)
                    .put(updateUser)
                    .delete(deleteUser);

module.exports = router;