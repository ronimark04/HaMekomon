const mongoose = require('mongoose');

const connectToLocalDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
        console.log('Connected to MongoDB locally');
    } catch (error) { console.log('Error connecting to MongoDB:', error); }
};

module.exports = connectToLocalDB;
