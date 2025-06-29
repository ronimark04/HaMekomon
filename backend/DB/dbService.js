const connectToLocalDB = require("./mongodb/connectToMongoLocally");
const config = require("config");

const ENVIRONMENT = config.get("ENVIRONMENT");

const connectToDB = async () => {
    if (ENVIRONMENT === "development") {
        await connectToLocalDB();
    }
    // if (ENVIRONMENT === "production") {
    //     await connectToAtlasDB();
    // }
};

module.exports = connectToDB;