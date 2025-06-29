import React, { useState, useEffect } from "react";
import LikeIcon from '../assets/like-1385-svgrepo-com.svg?react';
import DislikeIcon from '../assets/dislike-1387-svgrepo-com.svg?react';
import CommentIcon from '../assets/comment-5-svgrepo-com.svg?react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/authContext';
import { addToast, Button } from "@heroui/react";
import { motion } from "framer-motion";

const ICON_COLOR = "#C1873B";
const ICON_HOVER_COLOR = "#A15E0A";

const iconStyle = (active, hover, isMobile, rate) => {
    // For mobile, all rates have the same size
    if (isMobile) {
        return {
            width: 28,
            height: 28,
            background: "none",
            border: "none",
            color: hover ? ICON_HOVER_COLOR : active ? ICON_HOVER_COLOR : ICON_COLOR,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "6px 0",
            cursor: "pointer",
            position: "relative",
            transition: "color 0.15s",
            opacity: 0.85
        };
    }

    // For desktop, rate 4 gets smaller size
    const isRate4 = rate === 4;
    return {
        width: isRate4 ? 32 : 40,
        height: isRate4 ? 32 : 40,
        background: "none",
        border: "none",
        color: hover ? ICON_HOVER_COLOR : active ? ICON_HOVER_COLOR : ICON_COLOR,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: isRate4 ? "8px 0" : "10px 0",
        cursor: "pointer",
        position: "relative",
        transition: "color 0.15s",
        opacity: 0.85
    };
};

export default function ArtistActions({
    artistId,
    onComment = () => { },
    column = 'right',
    rate = 1
}) {
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [comments, setComments] = useState(0);
    const [hovered, setHovered] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Effect for screen size detection
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching data for artist:', artistId);

                const votesResponse = await fetch(`/artist-votes/artist/${artistId}`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                if (!votesResponse.ok) throw new Error('Failed to fetch votes');
                const votesData = await votesResponse.json();
                setLikes(votesData.upvotes.count);
                setDislikes(votesData.downvotes.count);

                if (user) {
                    setLiked(votesData.upvotes.users.includes(user._id));
                    setDisliked(votesData.downvotes.users.includes(user._id));
                }

                const commentsResponse = await fetch(`/comments/artist/${artistId}`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                if (!commentsResponse.ok) throw new Error('Failed to fetch comments');
                const commentsData = await commentsResponse.json();
                setComments(commentsData.length);
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

            if (!response.ok) throw new Error('Failed to vote');

            const votesResponse = await fetch(`/artist-votes/artist/${artistId}`, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            if (!votesResponse.ok) throw new Error('Failed to fetch updated votes');

            const votesData = await votesResponse.json();
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

    const handleCommentClick = () => {
        console.log('Navigate to artist page for comments');
        navigate(`/artist/${artistId}`);
    };

    const actions = [
        {
            key: "like",
            icon: <LikeIcon style={{
                width: isMobile ? 22 : (rate === 4 ? 26 : 32),
                height: isMobile ? 22 : (rate === 4 ? 26 : 32),
                display: 'block'
            }} />,
            count: likes,
            onClick: () => handleVote('up'),
            active: liked,
            countStyle: column === 'right'
                ? {
                    right: isMobile ? "-5px" : (rate === 4 ? "-6px" : "-7px"),
                    top: isMobile ? "-4px" : (rate === 4 ? "-5px" : "-6px")
                }
                : {
                    left: isMobile ? "-5px" : (rate === 4 ? "-6px" : "-7px"),
                    top: isMobile ? "-4px" : (rate === 4 ? "-5px" : "-6px")
                }
        },
        {
            key: "dislike",
            icon: <DislikeIcon style={{
                width: isMobile ? 22 : (rate === 4 ? 26 : 32),
                height: isMobile ? 22 : (rate === 4 ? 26 : 32),
                display: 'block'
            }} />,
            count: dislikes,
            onClick: () => handleVote('down'),
            active: disliked,
            countStyle: column === 'right'
                ? {
                    right: isMobile ? "-5px" : (rate === 4 ? "-6px" : "-7px"),
                    top: isMobile ? "-4px" : (rate === 4 ? "-5px" : "-6px")
                }
                : {
                    left: isMobile ? "-5px" : (rate === 4 ? "-6px" : "-7px"),
                    top: isMobile ? "-4px" : (rate === 4 ? "-5px" : "-6px")
                }
        },
        {
            key: "comment",
            icon: <CommentIcon style={{
                width: isMobile ? 18 : (rate === 4 ? 20 : 26),
                height: isMobile ? 18 : (rate === 4 ? 20 : 26),
                display: 'block',
                marginTop: isMobile ? '-10px' : (rate === 4 ? '-12px' : '-15px')
            }} />,
            count: comments,
            onClick: handleCommentClick,
            active: false,
            countStyle: column === 'right'
                ? {
                    right: isMobile ? "-5px" : (rate === 4 ? "-6px" : "-7px"),
                    top: isMobile ? "-4px" : (rate === 4 ? "-5px" : "-6px")
                }
                : {
                    left: isMobile ? "-5px" : (rate === 4 ? "-6px" : "-7px"),
                    top: isMobile ? "-4px" : (rate === 4 ? "-5px" : "-6px")
                }
        },
    ];

    if (loading) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                userSelect: "none"
            }}>
                <div style={{ color: ICON_COLOR }}>...</div>
            </div>
        );
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            userSelect: "none"
        }}>
            {actions.map((action) => (
                <motion.div
                    key={action.key}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <div
                        style={iconStyle(action.active, hovered === action.key, isMobile, rate)}
                        onClick={action.onClick}
                        onMouseEnter={() => setHovered(action.key)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <span style={{
                            position: "absolute",
                            ...action.countStyle,
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            color: ICON_COLOR,
                            borderRadius: isMobile ? "8px" : (rate === 4 ? "10px" : "12px"),
                            padding: isMobile ? "1px 4px" : (rate === 4 ? "1px 5px" : "2px 6px"),
                            fontSize: isMobile ? "10px" : (rate === 4 ? "11px" : "12px"),
                            fontWeight: 600,
                            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)"
                        }}>
                            {action.count}
                        </span>
                        {action.icon}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
