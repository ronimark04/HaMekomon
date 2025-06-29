const express = require('express');
const {
    getAllComments,
    getCommentsByArtist,
    getCommentsByUser,
    getCommentById,
    createComment,
    updateComment,
    deleteComment
} = require('../models/commentAccessDataService');

const auth = require('../../auth/authService');
const { handleError } = require('../../utils/handleErrors');

const router = express.Router();

// Get all comments
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        const comments = await getAllComments();
        res.send(comments);
    } catch (err) {
        handleError(res, 400, err.message);
    }
});


// Get all comments for an artist
router.get('/artist/:artistId', async (req, res) => {
    try {
        const { artistId } = req.params;
        const comments = await getCommentsByArtist(artistId);
        res.send(comments);
    } catch (err) {
        handleError(res, 400, err.message);
    }
});

// Get all comments by a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const comments = await getCommentsByUser(userId);
        res.send(comments);
    } catch (err) {
        handleError(res, 400, err.message);
    }
});

// Get comment by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await getCommentById(id);
        res.send(comment);
    } catch (err) {
        handleError(res, 400, err.message);
    }
});

// Create a new comment
router.post('/', auth, async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return handleError(res, 401, "Unauthorized: User must be logged in to post a comment");
        }

        const userId = req.user._id;
        const newComment = { ...req.body, user: userId };
        const comment = await createComment(newComment);
        res.status(201).send(comment);
    } catch (err) {
        handleError(res, 400, err.message);
    }
});


// Update a comment
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const existingComment = await getCommentById(id);

        if (!existingComment) {
            return handleError(res, 404, "Comment not found");
        }

        if (existingComment.user.toString() !== userId.toString() && !req.user.isAdmin) {
            return handleError(res, 403, "Unauthorized: not the comment's author");
        }

        const updatedComment = await updateComment(id, req.body);
        res.send(updatedComment);
    } catch (err) {
        handleError(res, 400, err.message);
    }
});

// Delete a comment
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const existingComment = await getCommentById(id);

        if (!existingComment) {
            return handleError(res, 404, "Comment not found");
        }

        if (existingComment.user.toString() !== userId.toString() && !req.user.isAdmin) {
            return handleError(res, 403, "Unauthorized to delete this comment");
        }

        await deleteComment(id);
        res.send({ message: "Comment deleted" });
    } catch (err) {
        handleError(res, 400, err.message);
    }
});

module.exports = router;
