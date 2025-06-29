const jwt = require("jsonwebtoken");
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '365d';

const generateAuthToken = (user) => {
    const payload = {
        _id: user._id,
        isAdmin: user.isAdmin,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    return token;
};

const verifyToken = (tokenFromClient) => {
    try {
        const payload = jwt.verify(tokenFromClient, JWT_SECRET);
        return payload;
    }
    catch (error) {
        return null;
    }
};

module.exports = { generateAuthToken, verifyToken };