const mongoose = require("mongoose");
const User = require("../../../users/models/mongodb/User");
const Artist = require("../../../artists/models/mongodb/Artist");

const artistVoteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artist",
        required: true
    },
    value: {
        type: String,
        enum: ["up", "down"],
        required: true
    }
}, { timestamps: true });

artistVoteSchema.index({ user: 1, artist: 1 }, { unique: true }); // user can only vote once on an artist

const ArtistVote = mongoose.model("ArtistVote", artistVoteSchema);

module.exports = ArtistVote;
