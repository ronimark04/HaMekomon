const connectToLocalDB = require("./mongodb/connectToMongoLocally");
const connectToAtlasDB = require("./mongodb/connectToAtlas");
const config = require("config");

const ENVIRONMENT = config.get("ENVIRONMENT");

const connectToDB = async () => {
    if (ENVIRONMENT === "development") {
        await connectToLocalDB();
    }
    if (ENVIRONMENT === "production") {
        await connectToAtlasDB();
    }
    if (!ENVIRONMENT) {
        throw new Error("NODE_ENV is not set");
    }
};

module.exports = connectToDB;