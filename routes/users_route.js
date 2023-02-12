const express = require('express');
const router = express.Router();
const {
    getUsers,
    getThisUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/user_controller');

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getThisUser)
                    .put(updateUser)
                    .delete(deleteUser);

module.exports = router;