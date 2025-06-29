const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist",
            required: true,
        },
        reply_to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
        },
        deleted: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);

// delete comment votes when comment is deleted
commentSchema.pre("remove", async function (next) {
    const CommentVote = mongoose.model("CommentVote");
    await CommentVote.deleteMany({ comment: this._id });
    next();
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
