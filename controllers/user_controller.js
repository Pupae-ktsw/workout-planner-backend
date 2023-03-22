// for handling error without using try/catch
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/user_model');

// @desc    Get Users
// @route   GET /Users
// @access  Private
// const getUsers = asyncHandler(async (req, res) => {
//     const users = await User.find();

//     res.status(200).json(users);
// });

// @desc    Get Specific Users
// @route   GET /users
// @access  Private
const getLoginUser = asyncHandler(async (req, res) => {
    // const thisUser = await User.findById(req.user.id);
    res.status(200).json(req.user);
});

// @desc    Login user
// @route   POST /users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        res.status(400);
        throw new Error('Missing required field(s)');
    }

    const user = await User.findOne({email: email});
    if(!user) {
        res.status(404);
        throw new Error('User doesn\'t exist');
    }
    if(!(bcrypt.compareSync(password, user.password))) {
        res.status(400);
        throw new Error('Wrong Password');
    }

    const accessToken = jwt.sign(
        {
            user: {
                name: user.name,
                email: user.email,
                _id: user.id
            },
        },
        process.env.ACCESS_TOKEN_SECRET,
    );
    res.status(200).json({accessToken: accessToken, message: 'Login Success'});
});

// @desc    Signup User
// @route   POST /users/signup
// @access  Public
const signupUser = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password){
        res.status(400);
        throw new Error('Missing required field(s)');
    }
    if(!validator.isEmail(email)){
        res.status(400);
        throw new Error('Invalid Email');
    }
    if(await User.findOne({email: email})){
        res.status(409);
        throw new Error('User already exist');
    }
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = password? bcrypt.hashSync(password, salt): null;
    const user = await User.create({
        name: name,
        email: email,
        password: hashPassword,
    });
    res.status(201).json(user);
});

// @desc    Update Users
// @route   PUT /users
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if(!user) {
        res.status(400);
        throw new Error('User not found');
    }
    console.log(`req body user: ${JSON.stringify(req.body)}`);

    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
        new: true,
    })
    res.status(200).json(updatedUser);
});

// @desc    Delete Users
// @route   DELETE /Users/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if(!user) {
        res.status(400);
        throw new Error('User not found');
    }
    const deletedUser = await User.findByIdAndRemove(req.params.id, req.body);
    res.status(200).json({ message: `Delete user ${deletedUser.name}`});
});

module.exports = {
    getLoginUser, loginUser, signupUser, updateUser, deleteUser
}