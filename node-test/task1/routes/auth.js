const express = require('express');

const {
    register,
    login,
    logout,
    info,
    postToken
} = require('../controllers/authController');
const {protect}=require("../middleware/auth");
const router = express.Router();

router.post('/signup', register);
router.post("/signin", login);
router.post("/signin/new_token", protect, postToken);
router.get("/logout", protect, logout);
router.get("/info", protect, info);

module.exports = router;
