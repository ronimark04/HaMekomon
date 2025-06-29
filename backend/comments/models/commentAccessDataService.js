const Comment = require('./mongodb/Comment');
const Artist = require('../../artists/models/mongodb/Artist');
const User = require('../../users/models/mongodb/User');

const getAllComments = async () => {
    try {
        return await Comment.find();
    } catch (err) {
        throw err;
    }
};

const getCommentsByArtist = async (artistId) => {
    return await Comment.find({ artist: artistId });
};

const getCommentsByUser = async (userId) => {
    return await Comment.find({ user: userId });
};

const getCommentById = async (commentId) => {
    return await Comment.findById(commentId);
};

const createComment = async (commentData) => {
    const artist = await Artist.findById(commentData.artist);
    if (!artist) throw new Error("Artist not found");

    const user = await User.findById(commentData.user);
    if (!user) throw new Error("User not found");

    const comment = new Comment(commentData);
    return await comment.save();
};

const updateComment = async (commentId, updatedComment) => {
    return await Comment.findByIdAndUpdate(commentId, updatedComment, { new: true });
};

const deleteComment = async (commentId) => {
    return await Comment.findByIdAndUpdate(commentId, { deleted: true }, { new: true });
};

module.exports = {
    getAllComments,
    getCommentsByArtist,
    getCommentsByUser,
    getCommentById,
    createComment,
    updateComment,
    deleteComment
};
