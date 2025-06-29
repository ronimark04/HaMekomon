import React, { useState, useEffect } from "react";
import LikeIcon from '../assets/like-1385-svgrepo-com.svg?react';
import DislikeIcon from '../assets/dislike-1387-svgrepo-com.svg?react';
import { useAuth } from '@/context/authContext';
import { addToast, Button } from "@heroui/react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

const ICON_COLOR = "#C1873B";
const ICON_HOVER_COLOR = "#A15E0A";

const iconStyle = {
    width: 48,
    height: 48,
    background: "none",
    border: "none",
    color: ICON_COLOR,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 10px",
    cursor: "pointer",
    position: "relative",
    transition: "color 0.15s"
};

export default function ArtistActionsArtistPage({ artistId }) {
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [loading, setLoading] = useState(true);
    const [hovered, setHovered] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch votes
                const votesResponse = await fetch(`/artist-votes/artist/${artistId}`, {
                    headers: {
                        'x-auth-token': localStorage.getItem('token')
                    }
                });
                if (!votesResponse.ok) throw new Error('Failed to fetch votes');
                const votesData = await votesResponse.json();
                setLikes(votesData.upvotes.count);
                setDislikes(votesData.downvotes.count);

                // Set liked/disliked based on current user's vote
                if (user) {
                    setLiked(votesData.upvotes.users.includes(user._id));
                    setDisliked(votesData.downvotes.users.includes(user._id));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (artistId) {
            fetchData();
        }
    }, [artistId, user]);

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
            const voteUrl = `/artist-votes/${artistId}/${voteType}`;
            const response = await fetch(voteUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
            });

            if (!response.ok) {
                throw new Error('Failed to vote');
            }

            // Fetch updated vote counts
            const votesUrl = `/artist-votes/artist/${artistId}`;
            const votesResponse = await fetch(votesUrl, {
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                }
            });

            if (!votesResponse.ok) {
                throw new Error('Failed to fetch updated votes');
            }

            const votesData = await votesResponse.json();

            // Update all vote-related state
            setLikes(votesData.upvotes.count);
            setDislikes(votesData.downvotes.count);
            setLiked(votesData.upvotes.users.includes(user._id));
            setDisliked(votesData.downvotes.users.includes(user._id));
        } catch (error) {
            console.error('Error voting:', error);
            addToast({
                description: "Failed to vote. Please try again.",
                color: "danger",
                timeout: 3000
            });
        }
    };

    if (loading) {
        return (
            <div style={{ width: '100%', minHeight: '88px', display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ color: ICON_COLOR }}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', minHeight: '65px', display: 'flex', gap: 48, justifyContent: 'center', alignItems: 'center' }}>
            <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
            >
                <div
                    style={{
                        ...iconStyle,
                        color: liked || hovered === 'like' ? ICON_HOVER_COLOR : ICON_COLOR,
                    }}
                    onClick={() => handleVote('up')}
                    onMouseEnter={() => setHovered('like')}
                    onMouseLeave={() => setHovered(null)}
                >
                    <span style={{
                        position: "absolute",
                        right: "-8px",
                        top: "-8px",
                        backgroundColor: "rgba(255, 255, 255, 0.75)",
                        color: ICON_COLOR,
                        borderRadius: "14px",
                        padding: "3px 8px",
                        fontSize: "16px",
                        fontWeight: 600,
                        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)"
                    }}>
                        {likes}
                    </span>
                    <LikeIcon style={{ width: 48, height: 48 }} />
                </div>
            </motion.div>
            <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
            >
                <div
                    style={{
                        ...iconStyle,
                        color: disliked || hovered === 'dislike' ? ICON_HOVER_COLOR : ICON_COLOR,
                    }}
                    onClick={() => handleVote('down')}
                    onMouseEnter={() => setHovered('dislike')}
                    onMouseLeave={() => setHovered(null)}
                >
                    <span style={{
                        position: "absolute",
                        right: "-8px",
                        top: "-8px",
                        backgroundColor: "rgba(255, 255, 255, 0.75)",
                        color: ICON_COLOR,
                        borderRadius: "14px",
                        padding: "3px 8px",
                        fontSize: "16px",
                        fontWeight: 600,
                        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)"
                    }}>
                        {dislikes}
                    </span>
                    <DislikeIcon style={{ width: 48, height: 48 }} />
                </div>
            </motion.div>
        </div>
    );
} 