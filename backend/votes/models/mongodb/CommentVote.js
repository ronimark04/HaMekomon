const mongoose = require("mongoose");

const commentVoteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: true
    },
    value: {
        type: String,
        enum: ["up", "down"],
        required: true
    }
}, { timestamps: true });

commentVoteSchema.index({ user: 1, comment: 1 }, { unique: true }); // user can only vote once on a comment

const CommentVote = mongoose.model("CommentVote", commentVoteSchema);

module.exports = CommentVote;

