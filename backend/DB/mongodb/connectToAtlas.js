const mongoose = require('mongoose');
require('dotenv').config();


const connectionStringForAtles = process.env.ATLAS_CONNECTION_STRING;

const connectToAtlasDB = async () => {
    try {
        await mongoose.connect(connectionStringForAtles);
        console.log('Connected to MongoDB in Atlas');
    } catch (error) { console.log('Error connecting to MongoDB:', error); }
};

module.exports = connectToAtlasDB;