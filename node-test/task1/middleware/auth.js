const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const User = require('../models/User');
const HttpException=require("../utils/httpException");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
        // Set token from cookie
    }
    // else if (req.cookies.token) {
    //   token = req.cookies.token;
    // }

    // Make sure token exists
    if (!token) {
        return next(new HttpException(401,'Not authorized to access this route'));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findByPk(decoded.id);
        next();
    } catch (err) {
        return next(new HttpException(401,'Not authorized to access this routeError'));
    }
});

