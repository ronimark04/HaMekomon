const mongoose = require("mongoose");
const User = require("../users/models/mongodb/User");
const Artist = require("../artists/models/mongodb/Artist");
const Comment = require("../comments/models/mongodb/Comment");
const ArtistVote = require("../votes/models/mongodb/ArtistVote");
const CommentVote = require("../votes/models/mongodb/CommentVote");

// Configuration for vote generation
const VOTE_CONFIG = {
    // Percentage of artists that will receive votes (100%)
    artistVotePercentage: 1.0,
    // Percentage of comments that will receive votes (100%)
    commentVotePercentage: 1.0,
    // Average votes per artist
    avgArtistVotes: 20,
    // Average votes per comment
    avgCommentVotes: 10,
    // Probability of upvote vs downvote
    upvoteProbability: 0.8,
    // Batch size for database operations
    batchSize: 1000,
    // Retry attempts for failed operations
    maxRetries: 3
};

// Helper function to get random number between min and max
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to get random element from array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random subset of array
function getRandomSubset(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
}

// Helper function to generate realistic vote count (using poisson-like distribution)
function getRealisticVoteCount(average) {
    // Simulate a more realistic distribution
    const variance = average * 0.6;
    const base = average + (Math.random() - 0.5) * variance * 2;
    return Math.max(1, Math.round(Math.abs(base))); // At least 1 vote, no negative
}

// Helper function to insert votes in batches with error handling
async function insertVotesInBatches(votes, VoteModel, voteType) {
    const batches = [];
    for (let i = 0; i < votes.length; i += VOTE_CONFIG.batchSize) {
        batches.push(votes.slice(i, i + VOTE_CONFIG.batchSize));
    }

    let totalInserted = 0;
    let totalErrors = 0;

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        let retries = 0;
        let success = false;

        while (retries < VOTE_CONFIG.maxRetries && !success) {
            try {
                // Use insertMany with ordered: false to continue on duplicates
                const result = await VoteModel.insertMany(batch, {
                    ordered: false,
                    rawResult: true
                });

                totalInserted += result.insertedCount || batch.length;
                success = true;

            } catch (error) {
                retries++;
                if (error.code === 11000) {
                    // Duplicate key error - this is expected due to unique constraints
                    totalInserted += batch.length; // Assume most were inserted
                    success = true;
                } else if (retries >= VOTE_CONFIG.maxRetries) {
                    console.error(`Batch ${i + 1}: Failed after ${retries} retries:`, error.message);
                    totalErrors += batch.length;
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                }
            }
        }
    }

    return { totalInserted, totalErrors };
}

// Function to generate votes with more realistic patterns
async function generateVotes() {
    try {
        // Check if votes already exist
        const existingArtistVotes = await ArtistVote.countDocuments();
        const existingCommentVotes = await CommentVote.countDocuments();

        if (existingArtistVotes > 0 || existingCommentVotes > 0) {
            console.log("Vote seeding failed: Votes already exist in database.");
            return;
        }

        // Get all users, artists, and comments
        const users = await User.find({}, '_id');
        const artists = await Artist.find({}, '_id');
        const comments = await Comment.find({}, '_id');

        if (users.length === 0 || artists.length === 0) {
            console.log("Vote seeding failed: No users or artists found. Please seed users and artists first.");
            return;
        }

        // Generate artist votes with more realistic patterns
        const artistVotes = [];
        const artistsToVote = getRandomSubset(artists, Math.floor(artists.length * VOTE_CONFIG.artistVotePercentage));

        for (const artist of artistsToVote) {
            const voteCount = getRealisticVoteCount(VOTE_CONFIG.avgArtistVotes);
            const voters = getRandomSubset(users, Math.min(voteCount, users.length));

            for (const voter of voters) {
                // Slightly more realistic vote distribution
                const randomValue = Math.random();
                let voteValue;

                if (randomValue < VOTE_CONFIG.upvoteProbability) {
                    voteValue = "up";
                } else {
                    voteValue = "down";
                }

                artistVotes.push({
                    user: voter._id,
                    artist: artist._id,
                    value: voteValue
                });
            }
        }

        // Generate comment votes
        const commentVotes = [];
        const commentsToVote = getRandomSubset(comments, Math.floor(comments.length * VOTE_CONFIG.commentVotePercentage));

        for (const comment of commentsToVote) {
            const voteCount = getRealisticVoteCount(VOTE_CONFIG.avgCommentVotes);
            const voters = getRandomSubset(users, Math.min(voteCount, users.length));

            for (const voter of voters) {
                const randomValue = Math.random();
                let voteValue;

                if (randomValue < VOTE_CONFIG.upvoteProbability) {
                    voteValue = "up";
                } else {
                    voteValue = "down";
                }

                commentVotes.push({
                    user: voter._id,
                    comment: comment._id,
                    value: voteValue
                });
            }
        }

        // Insert votes with advanced error handling
        let artistResults = { totalInserted: 0, totalErrors: 0 };
        let commentResults = { totalInserted: 0, totalErrors: 0 };

        if (artistVotes.length > 0) {
            artistResults = await insertVotesInBatches(artistVotes, ArtistVote, "artist");
        }

        if (commentVotes.length > 0) {
            commentResults = await insertVotesInBatches(commentVotes, CommentVote, "comment");
        }

        // Generate comprehensive statistics
        const finalArtistVotes = await ArtistVote.countDocuments();
        const finalCommentVotes = await CommentVote.countDocuments();

        const artistUpvotes = await ArtistVote.countDocuments({ value: "up" });
        const artistDownvotes = await ArtistVote.countDocuments({ value: "down" });
        const commentUpvotes = await CommentVote.countDocuments({ value: "up" });
        const commentDownvotes = await CommentVote.countDocuments({ value: "down" });

        const totalUpvotes = artistUpvotes + commentUpvotes;
        const totalDownvotes = artistDownvotes + commentDownvotes;

        console.log("Vote seeding succeeded!");

        if (artistResults.totalErrors > 0 || commentResults.totalErrors > 0) {
            console.log(`Errors: ${artistResults.totalErrors} artist votes, ${commentResults.totalErrors} comment votes`);
        }

        // Show some sample statistics
        const artistsWithVotes = await ArtistVote.distinct('artist');
        const commentsWithVotes = await CommentVote.distinct('comment');
        console.log(`Artists with votes: ${artistsWithVotes.length}/${artists.length} (${((artistsWithVotes.length / artists.length) * 100).toFixed(1)}%)`);
        console.log(`Comments with votes: ${commentsWithVotes.length}/${comments.length} (${((commentsWithVotes.length / comments.length) * 100).toFixed(1)}%)`);

    } catch (error) {
        console.error("Vote seeding failed:", error.message);
        throw error;
    }
}

// Export for use in other scripts
module.exports = { generateVotes };