const express = require("express");
const { voteComment, getVotesByComment, getVotesByUser } = require("../models/commentVoteAccessDataService");
const auth = require("../../auth/authService");
const { handleError } = require("../../utils/handleErrors");

const router = express.Router();

// Upvote/downvote comment
router.post("/:commentId/:voteType", auth, async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return handleError(res, 401, "Unauthorized: You must be logged in to vote");
        }

        const userId = req.user._id;
        const { commentId, voteType } = req.params;

        if (!["up", "down"].includes(voteType)) {
            return handleError(res, 400, "Invalid vote type");
        }

        const vote = await voteComment(commentId, userId, voteType);
        res.send(vote);
    } catch (err) {
        return handleError(res, 400, err.message);
    }
});

// Get votes for a comment
router.get("/comment/:commentId", async (req, res) => {
    try {
        const votes = await getVotesByComment(req.params.commentId);
        res.send(votes);
    } catch (err) {
        return handleError(res, 400, err.message);
    }
});

// Get all comment votes by user for ProfilePage
router.get("/user/:userId", async (req, res) => {
    try {
        const votes = await getVotesByUser(req.params.userId);
        res.send(votes);
    } catch (err) {
        return handleError(res, 400, err.message);
    }
});

module.exports = router;
