const { handleError } = require("../utils/handleErrors");
const { verifyToken } = require("./providers/jwt");

const auth = (req, res, next) => {
    try {
        const tokenFromClient = req.header("x-auth-token");
        if (!tokenFromClient) {
            const error = new Error("Error: No token");
            error.status = 401;
            throw error;
        }
        const userInfo = verifyToken(tokenFromClient);
        if (!userInfo) {
            const error = new Error("Error: Invalid token");
            error.status = 401;
            throw error;
        }

        req.user = userInfo;
        return next();
    }
    catch (error) {
        return handleError(res, 401, error.message);
    }
};

module.exports = auth;