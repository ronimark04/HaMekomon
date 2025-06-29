const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 16,
        match: [/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Username must start with a letter and can only contain English letters, numbers, and underscores (3-16 characters)']
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: true
    }
}, { timestamps: true });

// delete user votes when user is deleted
userSchema.pre("remove", async function (next) {
    const ArtistVote = mongoose.model("ArtistVote");
    const CommentVote = mongoose.model("CommentVote");

    await ArtistVote.deleteMany({ user: this._id });
    await CommentVote.deleteMany({ user: this._id });

    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
