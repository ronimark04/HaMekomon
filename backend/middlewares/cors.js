const cors = require('cors');

const corsMiddleware = cors({}); // open to all since we weren't given any specific url

module.exports = corsMiddleware;