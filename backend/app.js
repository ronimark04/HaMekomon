const express = require('express');
const PORT = process.env.PORT || 8181;
const connectToDB = require('./DB/dbService');
const chalk = require('chalk');
require('dotenv').config();
const app = express();
const router = require('./router/router');
const corsMiddleware = require('./middlewares/cors');
const morganLogger = require('./logger/morganLogger');
const User = require('./users/models/mongodb/User.js');
const seedDatabase = require('./seed_data/seed');
const seedUsersAndComments = require('./seed_data/seedAiData');
const { generateVotes } = require('./seed_data/seedVotesAdvanced');
const { seedAdminUser } = require('./seed_data/seedAdminUser');

app.use(express.json());
app.use(morganLogger);
app.use(corsMiddleware);

app.use(router);

app.listen(PORT, async () => {
    console.log(chalk.bgGreen(`Server is running on port ${PORT}`));
    try {
        await connectToDB();
        await seedDatabase(); // Seed basic app data (areas and artists)
        await seedUsersAndComments(); // Seed AI generated users and comments
        await generateVotes(); // Generate votes for artists and comments
        await seedAdminUser(); // Seed admin user
    } catch (error) {
        console.error(chalk.bgRed("Error during database setup:"), error);
    }

});