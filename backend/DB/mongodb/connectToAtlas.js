const mongoose = require('mongoose');
require('dotenv').config();

const connectToAtlasDB = async () => {
    try {
        await mongoose.connect(process.env.ATLAS_CONNECTION_STRING);
        console.log('Connected to MongoDB in Atlas');
    } catch (error) { console.log('Error connecting to MongoDB:', error); }
};

module.exports = connectToAtlasDB;