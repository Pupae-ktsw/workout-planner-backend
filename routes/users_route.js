const express = require('express');
const router = express.Router();
const {
    getUsers,
    getThisUser,
    loginUser,
    signupUser,
    updateUser,
    deleteUser
} = require('../controllers/user_controller');

router.route('/').get(getUsers);
router.route('/signup').post(signupUser);
router.route('/login').post(loginUser);
router.route('/:id').get(getThisUser)
                    .put(updateUser)
                    .delete(deleteUser);

module.exports = router;