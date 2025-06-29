import React, { useState, useEffect } from "react";
import UpArrowIcon from '../assets/up-arrow-svgrepo-com.svg?react';
import DownArrowIcon from '../assets/down-arrow-svgrepo-com.svg?react';
import ReplyIcon from '../assets/reply-svgrepo-com.svg?react';
import EditIcon from '../assets/edit-svgrepo-com.svg?react';
import DeleteIcon from '../assets/delete-svgrepo-com.svg?react';
import { useAuth } from '@/context/authContext';
import { addToast, Button } from "@heroui/react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

const ICON_COLOR = "#A15E0A";
const ICON_HOVER_COLOR = "#C1873B";

const iconStyle = (active, hover) => ({
    width: 32,
    height: 32,
    background: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 -1px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'transform 0.2s ease',
    transform: hover ? 'scale(1.1)' : 'scale(1)'
});

export default function CommentActions({ commentId, onReplyClick, isReplying, onEditClick, onDeleteClick, isAuthor, showReplyButton = true, onVoteChange }) {
    const { user } = useAuth();
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [hovered, setHovered] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userVote, setUserVote] = useState(null);
    const navigate = useNavigate();

    // Check if user can edit/delete (author or admin)
    const canEditDelete = isAuthor || (user && user.isAdmin);

    useEffect(() => {
        const fetchVotes = async () => {
            try {
                const res = await fetch(`/comment-votes/comment/${commentId}`);
                if (!res.ok) throw new Error('Failed to fetch comment votes');
                const data = await res.json();
                setLikes(data.upvotes.count);
                setDislikes(data.downvotes.count);
                if (user) {
                    setLiked(data.upvotes.users.includes(user._id));
                    setDisliked(data.downvotes.users.includes(user._id));
                } else {
                    setLiked(false);
                    setDisliked(false);
                }
            } catch (e) {
                // Optionally handle error
            } finally {
                setLoading(false);
            }
        };
        if (commentId) fetchVotes();
    }, [commentId, user]);

    useEffect(() => {
        async function fetchUserVote() {
            if (!user) return;
            try {
                const res = await fetch(`/comment-votes/user/${user._id}`);
                if (res.ok) {
                    const votes = await res.json();
                    // Check if user has voted on this comment
                    const hasUpvoted = votes.upvotes.includes(commentId);
                    const hasDownvoted = votes.downvotes.includes(commentId);

                    if (hasUpvoted) {
                        setUserVote('up');
                    } else if (hasDownvoted) {
                        setUserVote('down');
                    } else {
                        setUserVote(null);
                    }
                }
            } catch (error) {
                console.error('Error fetching user vote:', error);
            }
        }
        fetchUserVote();
    }, [commentId, user]);

    const handleVote = async (voteType) => {
        if (!user) {
            addToast({
                description: "Sign up or log in to like and dislike",
                color: "danger",
                timeout: 3000,
                endContent: (
                    <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        onPress={() => navigate('/signup')}
                    >
                        Sign Up
                    </Button>
                )
            });
            return;
        }
        try {
            const voteUrl = `/comment-votes/${commentId}/${voteType}`;
            const response = await fetch(voteUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
            });
            if (!response.ok) throw new Error('Failed to vote');

            // Refetch votes after voting
            const res = await fetch(`/comment-votes/comment/${commentId}`);
            if (!res.ok) throw new Error('Failed to fetch updated votes');
            const data = await res.json();
            setLikes(data.upvotes.count);
            setDislikes(data.downvotes.count);
            setLiked(data.upvotes.users.includes(user._id));
            setDisliked(data.downvotes.users.includes(user._id));

            // Refresh user vote
            const userVotesRes = await fetch(`/comment-votes/user/${user._id}`);
            if (userVotesRes.ok) {
                const votes = await userVotesRes.json();
                const hasUpvoted = votes.upvotes.includes(commentId);
                const hasDownvoted = votes.downvotes.includes(commentId);

                if (hasUpvoted) {
                    setUserVote('up');
                } else if (hasDownvoted) {
                    setUserVote('down');
                } else {
                    setUserVote(null);
                }
            }

            // Notify parent component about vote change
            if (onVoteChange) {
                onVoteChange(commentId, voteType);
            }
        } catch (e) {
            addToast({
                description: "Failed to vote. Please try again.",
                color: "danger",
                timeout: 3000
            });
        }
    };

    if (loading) return <div style={{ height: 32 }} />;

    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 4 }}>
            {canEditDelete && (
                <>
                    <motion.div
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <div
                            onClick={onEditClick}
                            style={iconStyle(false, hovered === 'edit')}
                            onMouseEnter={() => setHovered('edit')}
                            onMouseLeave={() => setHovered(null)}
                            title="Edit comment"
                        >
                            <div style={{ color: hovered === 'edit' ? ICON_COLOR : ICON_HOVER_COLOR, transition: "color 0.15s" }}>
                                <EditIcon style={{ width: 20, height: 20, position: 'relative', left: '6px' }} />
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <div
                            onClick={onDeleteClick}
                            style={iconStyle(false, hovered === 'delete')}
                            onMouseEnter={() => setHovered('delete')}
                            onMouseLeave={() => setHovered(null)}
                            title="Delete comment"
                        >
                            <div style={{ color: hovered === 'delete' ? ICON_COLOR : ICON_HOVER_COLOR, transition: "color 0.15s" }}>
                                <DeleteIcon style={{ width: 20, height: 20 }} />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
            <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
            >
                <div
                    style={iconStyle(liked, hovered === 'like')}
                    onClick={() => handleVote('up')}
                    onMouseEnter={() => setHovered('like')}
                    onMouseLeave={() => setHovered(null)}
                >
                    <span style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: hovered === 'like' ? ICON_COLOR : liked ? ICON_COLOR : ICON_HOVER_COLOR,
                        marginRight: 2,
                        transition: "color 0.15s"
                    }}>{likes}</span>
                    <div style={{ color: hovered === 'like' ? ICON_COLOR : liked ? ICON_COLOR : ICON_HOVER_COLOR, transition: "color 0.15s" }}>
                        <UpArrowIcon style={{ width: 24, height: 24, display: 'block' }} />
                    </div>
                </div>
            </motion.div>
            <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
            >
                <div
                    style={iconStyle(disliked, hovered === 'dislike')}
                    onClick={() => handleVote('down')}
                    onMouseEnter={() => setHovered('dislike')}
                    onMouseLeave={() => setHovered(null)}
                >
                    <span style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: hovered === 'dislike' ? ICON_COLOR : disliked ? ICON_COLOR : ICON_HOVER_COLOR,
                        marginRight: 1,
                        marginLeft: 3,
                        transition: "color 0.15s"
                    }}>{dislikes}</span>
                    <div style={{ color: hovered === 'dislike' ? ICON_COLOR : disliked ? ICON_COLOR : ICON_HOVER_COLOR, transition: "color 0.15s" }}>
                        <DownArrowIcon style={{ width: 24, height: 24, display: 'block' }} />
                    </div>
                </div>
            </motion.div>
            {user && showReplyButton && (
                <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <div
                        style={iconStyle(isReplying, hovered === 'reply')}
                        onClick={onReplyClick}
                        onMouseEnter={() => setHovered('reply')}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <div style={{ color: hovered === 'reply' ? ICON_COLOR : isReplying ? ICON_COLOR : ICON_HOVER_COLOR, transition: "color 0.15s" }}>
                            <ReplyIcon style={{ width: 22, height: 22, display: 'block' }} />
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
} 