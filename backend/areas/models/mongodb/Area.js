const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    }
});

module.exports = mongoose.model("Area", areaSchema);