const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const User = require("../users/models/mongodb/User");
const Comment = require("../comments/models/mongodb/Comment");
const Artist = require("../artists/models/mongodb/Artist");

// Helper function to strip parentheses and their contents from artist names
function stripParentheses(name) {
    if (!name) return name;
    return name.replace(/\s*\([^)]*\)/g, '').trim();
}

async function seedUsersAndComments() {
    try {
        // Check if users already exist
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log("Users already exist in database. Skipping user and comment seeding.");
            return;
        }

        // Check if artists exist (required for comments)
        const artistCount = await Artist.countDocuments();
        if (artistCount === 0) {
            console.log("No artists found in database. Please seed artists first.");
            return;
        }

        console.log("Starting user and comment seeding...");

        // Load and seed users
        const usersPath = path.join(__dirname, "users.json");
        const usersData = JSON.parse(fs.readFileSync(usersPath, "utf-8"));

        const insertedUsers = await User.insertMany(usersData);
        console.log(`✅ Seeded ${insertedUsers.length} users.`);

        // Create a map of usernames to ObjectIds
        const userMap = new Map(
            insertedUsers.map(user => [user.username, user._id])
        );

        // Create a map of artist names to ObjectIds (with parentheses stripped)
        const artists = await Artist.find({});
        const artistMap = new Map();
        artists.forEach(artist => {
            // Handle both English and Hebrew names, stripping parentheses
            if (artist.name && artist.name.eng) {
                const cleanName = stripParentheses(artist.name.eng);
                artistMap.set(cleanName.toLowerCase(), artist._id);
            }
            if (artist.name && artist.name.heb) {
                const cleanName = stripParentheses(artist.name.heb);
                artistMap.set(cleanName.toLowerCase(), artist._id);
            }
        });

        // Load comments from json files
        const comments1Path = path.join(__dirname, "comments1.json");
        const comments1Data = JSON.parse(fs.readFileSync(comments1Path, "utf-8"));
        const comments2Path = path.join(__dirname, "comments2.json");
        const comments2Data = JSON.parse(fs.readFileSync(comments2Path, "utf-8"));
        const comments3Path = path.join(__dirname, "comments3.json");
        const comments3Data = JSON.parse(fs.readFileSync(comments3Path, "utf-8"));
        const comments4Path = path.join(__dirname, "comments4.json");
        const comments4Data = JSON.parse(fs.readFileSync(comments4Path, "utf-8"));
        const comments5Path = path.join(__dirname, "comments5.json");
        const comments5Data = JSON.parse(fs.readFileSync(comments5Path, "utf-8"));
        const comments6Path = path.join(__dirname, "comments6.json");
        const comments6Data = JSON.parse(fs.readFileSync(comments6Path, "utf-8"));
        const comments7Path = path.join(__dirname, "comments7.json");
        const comments7Data = JSON.parse(fs.readFileSync(comments7Path, "utf-8"));
        const comments8Path = path.join(__dirname, "comments8.json");
        const comments8Data = JSON.parse(fs.readFileSync(comments8Path, "utf-8"));
        const comments9Path = path.join(__dirname, "comments9.json");
        const comments9Data = JSON.parse(fs.readFileSync(comments9Path, "utf-8"));

        // Combine all comment data
        let allComments = [...comments1Data, ...comments2Data, ...comments3Data, ...comments4Data, ...comments5Data, ...comments6Data, ...comments7Data, ...comments8Data, ...comments9Data];

        // Group comments by thread_id and sort by thread_position
        const threadGroups = new Map();
        for (const commentData of allComments) {
            const threadId = commentData.thread_id;
            if (!threadGroups.has(threadId)) {
                threadGroups.set(threadId, []);
            }
            threadGroups.get(threadId).push(commentData);
        }

        // Sort each thread by thread_position
        for (const [threadId, comments] of threadGroups) {
            comments.sort((a, b) => a.thread_position - b.thread_position);
        }

        // Process comments thread by thread, position by position
        const commentsToInsert = [];
        const threadCommentMap = new Map(); // thread_id -> Map of text -> comment ObjectId

        for (const [threadId, threadComments] of threadGroups) {
            const threadTextMap = new Map();
            threadCommentMap.set(threadId, threadTextMap);

            for (const commentData of threadComments) {
                const username = commentData.user_username;
                const artistName = commentData.artist_name;
                const userId = userMap.get(username);
                // Strip parentheses from artist name when looking up
                const cleanArtistName = stripParentheses(artistName);
                const artistId = artistMap.get(cleanArtistName.toLowerCase());

                if (!userId) {
                    console.warn(`No user found for username: '${username}'`);
                    continue;
                }

                if (!artistId) {
                    console.warn(`No artist found for: '${artistName}' (cleaned: '${cleanArtistName}')`);
                    continue;
                }

                const comment = {
                    text: commentData.text,
                    user: userId,
                    artist: artistId,
                    reply_to: null, // Always null during initial insertion
                    deleted: false
                };

                commentsToInsert.push({
                    commentData: comment,
                    thread_id: threadId,
                    reply_to_text: commentData.reply_to_text
                });

                // Store this comment's text for future reference
                threadTextMap.set(commentData.text, commentData.text); // Placeholder
            }
        }

        // Insert all comments
        const insertedComments = await Comment.insertMany(
            commentsToInsert.map(item => item.commentData)
        );
        console.log(`Seeded ${insertedComments.length} comments.`);

        // Update the thread comment maps with actual ObjectIds
        let commentIndex = 0;
        for (const [threadId, threadComments] of threadGroups) {
            const threadTextMap = threadCommentMap.get(threadId);

            for (const commentData of threadComments) {
                const insertedComment = insertedComments[commentIndex];
                if (insertedComment) {
                    // Update the map with the actual ObjectId
                    threadTextMap.set(commentData.text, insertedComment._id);
                }
                commentIndex++;
            }
        }

        // Now update all reply_to references with actual ObjectIds
        commentIndex = 0;
        for (const [threadId, threadComments] of threadGroups) {
            const threadTextMap = threadCommentMap.get(threadId);

            for (const commentData of threadComments) {
                const insertedComment = insertedComments[commentIndex];
                if (insertedComment && commentData.reply_to_text) {
                    const replyToId = threadTextMap.get(commentData.reply_to_text);
                    if (replyToId && replyToId !== commentData.reply_to_text) { // Make sure it's an actual ObjectId
                        insertedComment.reply_to = replyToId;
                        await insertedComment.save();
                    }
                }
                commentIndex++;
            }
        }

        console.log("User and comment seeding completed successfully!");

    } catch (error) {
        console.error("Error seeding users and comments:", error);
        throw error;
    }
}

module.exports = seedUsersAndComments;
