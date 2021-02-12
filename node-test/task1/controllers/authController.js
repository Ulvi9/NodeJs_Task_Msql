const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const HttpException = require("../utils/httpException");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
    //Create a new user
    const {email, password} = req.body;
    const user = await User.create({email: email, password: password});
    await sendTokenResponse(user, 200, req, res);
});

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return next(new HttpException(404, "Email or Password invalid"));
    }
    const user = await User.findOne({where: {email: req.body.email}});

    if (!user) {
        return next(new HttpException(404, "User not found"));
    }

    //if password matches
    const isMatch = await matchPassword(password, req);
    if (!isMatch) {
        return next(new HttpException(404, "Password dont match"));
    }
    const response = await sendTokenResponse(user, 200, req, res);

    res.status(200).json(response);

});

//refresh token
exports.postToken = asyncHandler(async (req, res, next) => {
    // refresh the damn token
    const {refreshToken} = req.body;
    //check refresh token exist
    if (!refreshToken) {
        return next(new HttpException(404, "Invalid Refresh Token"));
    }
    // if refresh token exists
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findByPk(decoded.id);
    const newToken = jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 100),
        httpOnly: true
    });
    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    res.status(200).cookie('token', newToken, options).json({token: newToken});

});

// @desc      log out clear cookie
// @route     GET /api/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 100),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        data: {},
    });
});

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
exports.info = asyncHandler(async (req, res, next) => {
    // user is already available in req due to the protect middleware
    // const user = req.user;
    console.log(req.user)
    const user = await User.findByPk(req.user.id);

    res.status(200).json({
        success: true,
        data: user,
    });
});

// Get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, req, res) => {
    // Create token
    const token = await getSignedJwtToken(req);

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    const refreshToken = jwt.sign({id: user.id, email: user.email}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
    const response = {
        token,
        refreshToken
    }
    res
        .status(statusCode)
        .cookie('token', token, options)
        .json(response);
};

// Sign JWT and return
const getSignedJwtToken = async (req) => {
    const user = await User.findOne({
        where: {
            email: req.body.email
        }
    });
    return jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
}

//check password match
const matchPassword = async function (enteredPassword, req) {
    const user = await User.findOne({
        where: {
            email: req.body.email
        }
    });
    return await bcrypt.compare(enteredPassword, user.password);
};
