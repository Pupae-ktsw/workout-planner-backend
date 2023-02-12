// for handling error without using try/catch
const asyncHandler = require('express-async-handler');

// @desc    Get Users
// @route   GET /Users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'This is user page'});
});

// @desc    Get Specific Users
// @route   GET /Users/:id
// @access  Private
const getThisUser = asyncHandler(async (req, res) => {
    res.status(200).json({ message: `This is user id ${req.params.id}`});
});

// @desc    Create User
// @route   POST /Users
// @access  Private
const createUser = asyncHandler(async (req, res) => {
    console.log(req.body);

    // validation fields and warning to user req.body.<fieldNameJSON>
    if(!req.body) {
        res.status(400);
        throw new Error('Wrong Request body');
    }
    res.status(200).json({ message: 'Create user page'});
});

// @desc    Update Users
// @route   PUT /Users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    res.status(200).json({ message: `Update user ${req.params.id}`});
});

// @desc    Delete Users
// @route   DELETE /Users/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
    res.status(200).json({ message: `Delete user ${req.params.id}`});
});

module.exports = {
    getUsers, getThisUser, createUser, updateUser, deleteUser
}