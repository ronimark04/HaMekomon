const express = require("express");
const { voteArtist, getVotesByArtist, getVotesByUser } = require("../models/artistVoteAccessDataService");
const auth = require("../../auth/authService");
const { handleError } = require("../../utils/handleErrors");
const router = express.Router();

// Upvote/downvote artist
router.post("/:artistId/:voteType", auth, async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return handleError(res, 401, "Unauthorized: You must be logged in to vote");
        }

        const userId = req.user._id;
        const { artistId, voteType } = req.params;

        if (!["up", "down"].includes(voteType)) {
            return handleError(res, 400, "Invalid vote type");
        }

        const vote = await voteArtist(artistId, userId, voteType);
        res.send(vote);
    } catch (err) {
        return handleError(res, 400, err.message);
    }
});

// Get votes for an artist
router.get("/artist/:artistId", async (req, res) => {
    try {
        const votes = await getVotesByArtist(req.params.artistId);
        res.send(votes);
    } catch (err) {
        return handleError(res, 400, err.message);
    }
});

// Get all artist votes by a user for ProfilePage
router.get("/user/:userId", async (req, res) => {
    try {
        const votes = await getVotesByUser(req.params.userId);
        res.send(votes);
    } catch (err) {
        return handleError(res, 400, err.message);
    }
});

module.exports = router;
