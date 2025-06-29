const ArtistVote = require('./mongodb/ArtistVote');
const Artist = require('../../artists/models/mongodb/Artist');
const User = require('../../users/models/mongodb/User');

const voteArtist = async (artistId, userId, value) => {
    const artist = await Artist.findById(artistId);
    if (!artist) throw new Error("Artist not found");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const existing = await ArtistVote.findOne({ artist: artistId, user: userId });

    if (existing) {
        if (existing.value === value) {
            await ArtistVote.findByIdAndDelete(existing._id);
            return { message: "Vote removed" };
        } else {
            existing.value = value;
            await existing.save();
            return { message: "Vote updated", vote: existing };
        }
    }

    const vote = new ArtistVote({ artist: artistId, user: userId, value });
    await vote.save();
    return { message: "Vote added", vote };
};

const getVotesByArtist = async (artistId) => {
    const votes = await ArtistVote.find({ artist: artistId }).select("user value");

    const result = {
        upvotes: {
            count: 0,
            users: []
        },
        downvotes: {
            count: 0,
            users: []
        }
    };

    for (let vote of votes) {
        const uid = vote.user.toString();
        if (vote.value === "up") {
            result.upvotes.count++;
            result.upvotes.users.push(uid);
        } else if (vote.value === "down") {
            result.downvotes.count++;
            result.downvotes.users.push(uid);
        }
    }

    return result;
};

const getVotesByUser = async (userId) => {
    const votes = await ArtistVote.find({ user: userId }).select("artist value");

    const result = {
        upvotes: [],
        downvotes: []
    };

    for (let vote of votes) {
        const artistId = vote.artist.toString();
        if (vote.value === "up") {
            result.upvotes.push(artistId);
        } else if (vote.value === "down") {
            result.downvotes.push(artistId);
        }
    }

    return result;
};

module.exports = {
    voteArtist,
    getVotesByArtist,
    getVotesByUser
};
