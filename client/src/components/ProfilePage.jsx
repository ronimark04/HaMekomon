import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/authContext';
import { useLanguage } from '@/context/languageContext';
import CommentActions from './CommentActions';
import ChangePasswordModal from './ChangePasswordModal';
import DeleteAccountModal from './DeleteAccountModal';
import DeleteUserModal from './DeleteUserModal';
import { motion } from 'framer-motion';
import { Avatar, Spinner, addToast, Button } from "@heroui/react";
import LikeIcon from '../assets/like-1385-svgrepo-com.svg?react';
import DislikeIcon from '../assets/dislike-1387-svgrepo-com.svg?react';

// Helper function to detect if text is mainly Hebrew
function isMainlyHebrew(text) {
    if (!text) return false;
    const hebrewPattern = /[\u0590-\u05FF]/g;
    const hebrewChars = (text.match(hebrewPattern) || []).length;
    return hebrewChars > text.length * 0.5;
}

// Helper function to trim parentheses from artist names
function trimParentheses(name) {
    if (!name) return name;
    // Remove content within parentheses (including the parentheses themselves)
    return name.replace(/\s*\([^)]*\)/g, '').trim();
}

const COMMENT_BACKGROUNDS = [
    '#fffef5',
    '#fff8e1',
    '#fff3e0',
    '#ffecb3',
    '#ffe0b2'
];

const ProfilePage = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const { language } = useLanguage();
    const [profileUser, setProfileUser] = useState(null);
    const [likedArtists, setLikedArtists] = useState([]);
    const [dislikedArtists, setDislikedArtists] = useState([]);
    const [comments, setComments] = useState([]);
    const [likedComments, setLikedComments] = useState([]);
    const [dislikedComments, setDislikedComments] = useState([]);
    const [replyToComments, setReplyToComments] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState('');
    const [showCount, setShowCount] = useState({
        comments: 3,
        liked: 3,
        disliked: 3
    });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [artistNamesById, setArtistNamesById] = useState({});
    const [artistNamesByIdEng, setArtistNamesByIdEng] = useState({});

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch user profile
                const userRes = await fetch(`/users/${userId}`);
                const userData = await userRes.json();
                setProfileUser(userData);

                // Fetch user's votes
                const votesRes = await fetch(`/artist-votes/user/${userId}`);
                const votesData = await votesRes.json();

                // Fetch liked artists
                const likedArtistsPromises = votesData.upvotes.map(async (artistId) => {
                    const res = await fetch(`/artists/${artistId}`);
                    return res.json();
                });
                const likedArtistsData = await Promise.all(likedArtistsPromises);
                setLikedArtists(likedArtistsData);

                // Fetch disliked artists
                const dislikedArtistsPromises = votesData.downvotes.map(async (artistId) => {
                    const res = await fetch(`/artists/${artistId}`);
                    return res.json();
                });
                const dislikedArtistsData = await Promise.all(dislikedArtistsPromises);
                setDislikedArtists(dislikedArtistsData);

                // Fetch user's comments
                const commentsRes = await fetch(`/comments/user/${userId}`);
                const commentsData = await commentsRes.json();
                setComments(commentsData);

                // Fetch user's liked comments
                const commentVotesRes = await fetch(`/comment-votes/user/${userId}`);
                const commentVotesData = await commentVotesRes.json();

                // Fetch liked comments
                const likedCommentsPromises = commentVotesData.upvotes.map(async (commentId) => {
                    const res = await fetch(`/comments/${commentId}`);
                    return res.json();
                });
                const likedCommentsData = await Promise.all(likedCommentsPromises);
                setLikedComments(likedCommentsData);

                // Fetch disliked comments
                const dislikedCommentsPromises = commentVotesData.downvotes.map(async (commentId) => {
                    const res = await fetch(`/comments/${commentId}`);
                    return res.json();
                });
                const dislikedCommentsData = await Promise.all(dislikedCommentsPromises);
                setDislikedComments(dislikedCommentsData);

                // Fetch reply_to comments for both user's comments and liked comments
                const allComments = [...commentsData, ...likedCommentsData, ...dislikedCommentsData];
                const replyToIds = allComments
                    .filter(comment => comment.reply_to)
                    .map(comment => comment.reply_to);

                const uniqueReplyToIds = [...new Set(replyToIds)];
                const replyToCommentsPromises = uniqueReplyToIds.map(async (commentId) => {
                    const res = await fetch(`/comments/${commentId}`);
                    return res.json();
                });
                const replyToCommentsData = await Promise.all(replyToCommentsPromises);

                // Create a map of reply_to comments
                const replyToMap = {};
                replyToCommentsData.forEach(comment => {
                    replyToMap[comment._id] = comment;
                });
                setReplyToComments(replyToMap);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        }
        if (userId) fetchData();
    }, [userId]);

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 768);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Helper to refresh all comment-related states
    const refreshAllComments = async () => {
        // Fetch user's comments
        const commentsRes = await fetch(`/comments/user/${userId}`);
        const commentsData = await commentsRes.json();
        setComments(commentsData);

        // Fetch user's liked/disliked comments
        const commentVotesRes = await fetch(`/comment-votes/user/${userId}`);
        const commentVotesData = await commentVotesRes.json();

        // Fetch liked comments
        const likedCommentsPromises = commentVotesData.upvotes.map(async (commentId) => {
            const res = await fetch(`/comments/${commentId}`);
            return res.json();
        });
        const likedCommentsData = await Promise.all(likedCommentsPromises);
        setLikedComments(likedCommentsData);

        // Fetch disliked comments
        const dislikedCommentsPromises = commentVotesData.downvotes.map(async (commentId) => {
            const res = await fetch(`/comments/${commentId}`);
            return res.json();
        });
        const dislikedCommentsData = await Promise.all(dislikedCommentsPromises);
        setDislikedComments(dislikedCommentsData);

        // Fetch reply_to comments for all
        const allComments = [...commentsData, ...likedCommentsData, ...dislikedCommentsData];
        const replyToIds = allComments
            .filter(comment => comment.reply_to)
            .map(comment => comment.reply_to);
        const uniqueReplyToIds = [...new Set(replyToIds)];
        const replyToCommentsPromises = uniqueReplyToIds.map(async (commentId) => {
            const res = await fetch(`/comments/${commentId}`);
            return res.json();
        });
        const replyToCommentsData = await Promise.all(replyToCommentsPromises);
        const replyToMap = {};
        replyToCommentsData.forEach(comment => {
            replyToMap[comment._id] = comment;
        });
        setReplyToComments(replyToMap);
    };

    const handleEdit = async (commentId) => {
        if (!editText.trim()) return;
        const res = await fetch(`/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                text: editText,
            }),
        });
        if (res.ok) {
            setEditText('');
            setEditingCommentId(null);
            // Refresh all comments (own, liked, disliked)
            await refreshAllComments();
        }
    };

    const handleDelete = async (commentId) => {
        addToast({
            description: "Are you sure you want to delete this comment?",
            color: "warning",
            timeout: 5000,
            endContent: (
                <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    onPress={async () => {
                        // Proceed with deletion
                        const res = await fetch(`/comments/${commentId}`, {
                            method: 'DELETE',
                            headers: {
                                'x-auth-token': localStorage.getItem('token'),
                            },
                        });
                        if (res.ok) {
                            // Refresh all comments (own, liked, disliked)
                            await refreshAllComments();
                        }
                    }}
                >
                    Confirm
                </Button>
            )
        });
    };

    const handleVoteChange = async (commentId, voteType) => {
        // Refresh the liked and disliked comments sections
        try {
            const commentVotesRes = await fetch(`/comment-votes/user/${userId}`);
            const commentVotesData = await commentVotesRes.json();

            // Fetch liked comments
            const likedCommentsPromises = commentVotesData.upvotes.map(async (commentId) => {
                const res = await fetch(`/comments/${commentId}`);
                return res.json();
            });
            const likedCommentsData = await Promise.all(likedCommentsPromises);
            setLikedComments(likedCommentsData);

            // Fetch disliked comments
            const dislikedCommentsPromises = commentVotesData.downvotes.map(async (commentId) => {
                const res = await fetch(`/comments/${commentId}`);
                return res.json();
            });
            const dislikedCommentsData = await Promise.all(dislikedCommentsPromises);
            setDislikedComments(dislikedCommentsData);
        } catch (error) {
            console.error('Error refreshing comments after vote change:', error);
        }
    };

    // Fetch artist names for comments if not already loaded
    useEffect(() => {
        const allComments = [...comments, ...likedComments, ...dislikedComments];
        const artistIds = Array.from(new Set(allComments.map(c => c.artist).filter(Boolean)));
        const missingIds = artistIds.filter(id => !artistNamesById[id] || !artistNamesByIdEng[id]);
        if (missingIds.length > 0) {
            Promise.all(missingIds.map(id => fetch(`/artists/${id}`).then(res => res.json()))).then(artists => {
                const newNames = {};
                const newNamesEng = {};
                artists.forEach(artist => {
                    if (artist && artist._id) {
                        newNames[artist._id] = artist.name?.heb || 'אמן';
                        newNamesEng[artist._id] = artist.name?.eng || 'Artist';
                    }
                });
                setArtistNamesById(prev => ({ ...prev, ...newNames }));
                setArtistNamesByIdEng(prev => ({ ...prev, ...newNamesEng }));
            });
        }
        // eslint-disable-next-line
    }, [comments, likedComments, dislikedComments]);

    const renderComment = (comment, isAuthor = false) => {
        const isEditing = editingCommentId === comment._id;
        const replyToComment = comment.reply_to ? replyToComments[comment.reply_to] : null;
        const artistId = comment.artist;
        const artistName = language === 'heb'
            ? (artistNamesById[artistId] || 'אמן')
            : (artistNamesByIdEng[artistId] || 'Artist');
        return (
            <div
                key={comment._id}
                style={{
                    background: COMMENT_BACKGROUNDS[0],
                    borderRadius: 12,
                    padding: '16px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    position: 'relative'
                }}
            >
                {/* Artist line link */}
                <div style={{
                    color: '#666',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    direction: language === 'heb' ? 'rtl' : 'ltr',
                    fontStyle: 'italic'
                }}>
                    <Link to={artistId ? `/artist/${artistId}` : '#'} style={{ color: '#666', textDecoration: 'none', fontStyle: 'italic' }}>
                        {language === 'heb' ? `על ${artistName}` : `On ${artistName}`}
                    </Link>
                </div>
                {/* Reply to line, if present */}
                {replyToComment && (
                    <div style={{
                        color: '#666',
                        fontSize: '0.9rem',
                        marginBottom: '8px',
                        direction: language === 'heb' ? 'rtl' : 'ltr'
                    }}>
                        {language === 'heb' ? 'בתגובה ל' : 'In reply to:'} {replyToComment.text.substring(0, 30)}...
                    </div>
                )}
                {isEditing ? (
                    <div style={{ margin: '12px 0', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            dir={isMainlyHebrew(editText) ? 'rtl' : 'ltr'}
                            style={{
                                width: '70%',
                                padding: '8px 12px',
                                borderRadius: 8,
                                border: '1px solid #ccc',
                                fontSize: 14,
                                marginRight: 8,
                                outline: 'none',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        />
                        <button
                            onClick={() => handleEdit(comment._id)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 8,
                                background: '#A15E0A',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#C1873B'}
                            onMouseOut={e => e.currentTarget.style.background = '#A15E0A'}
                        >
                            Submit
                        </button>
                    </div>
                ) : (
                    <div style={{
                        margin: '8px 0',
                        lineHeight: 1.5,
                        fontSize: 14,
                        color: '#333',
                        direction: isMainlyHebrew(comment.text) ? 'rtl' : 'ltr',
                        whiteSpace: 'pre-line'
                    }}>
                        {comment.deleted ? (
                            <span style={{ color: '#888', fontStyle: 'italic' }}>[Deleted]</span>
                        ) : (
                            comment.text
                        )}
                    </div>
                )}
                {!comment.deleted && (
                    <div style={{ marginTop: 6 }}>
                        <CommentActions
                            commentId={comment._id}
                            onReplyClick={() => { }}
                            isReplying={false}
                            onEditClick={() => {
                                if (isEditing) {
                                    setEditingCommentId(null);
                                    setEditText('');
                                } else {
                                    setEditingCommentId(comment._id);
                                    setEditText(comment.text);
                                }
                            }}
                            onDeleteClick={() => handleDelete(comment._id)}
                            isAuthor={isAuthor}
                            showReplyButton={false}
                            onVoteChange={handleVoteChange}
                        />
                    </div>
                )}
            </div>
        );
    };

    // Helper to get visible comments based on section and isMobile
    const getVisibleComments = (commentsArr, section) => {
        if (!isMobile) return commentsArr.filter(comment => !comment.deleted);
        return commentsArr.filter(comment => !comment.deleted).slice(0, showCount[section]);
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Spinner color="danger" size="lg" /></div>;
    if (!profileUser) return <div style={{ padding: 40, textAlign: 'center' }}>User not found.</div>;

    const isOwnProfile = currentUser && currentUser._id === userId;
    const canDeleteUser = isOwnProfile || (currentUser && currentUser.isAdmin);

    const handlePasswordChangeSuccess = () => {
        addToast({
            description: "Password changed successfully!",
            color: "success",
            timeout: 3000
        });
    };

    const handleDeleteUserSuccess = () => {
        window.location.href = '/';
    };

    return (
        <div style={{ minHeight: '100vh', padding: '24px 4vw' }}>
            {/* User name headline */}
            <div style={{ maxWidth: '1400px', margin: '0 auto 32px auto', width: '100%' }}>
                <h1 style={{
                    fontSize: '3rem',
                    color: '#5D4037',
                    textAlign: 'center',
                    marginTop: '18px',
                    fontFamily: 'adobe-hebrew',
                    textShadow: '0 0 12px #FFF8EF',
                    direction: language === 'heb' ? 'rtl' : 'ltr'
                }}>
                    {profileUser.username}
                </h1>

                {/* User stats */}
                <div style={{
                    textAlign: 'center',
                    fontSize: '1.1rem',
                    marginTop: '-10px',
                    direction: language === 'heb' ? 'rtl' : 'ltr'
                }}>
                    <span style={{
                        color: '#5D4037',
                        textShadow: '0 0 8px #FFF8EF',
                        marginRight: language === 'heb' ? '0' : '16px',
                        marginLeft: language === 'heb' ? '16px' : '0'
                    }}>
                        {likedArtists.length} {language === 'heb' ? 'לייקים' : 'likes'}
                    </span>
                    <span style={{
                        color: '#5D4037',
                        textShadow: '0 0 8px #FFF8EF',
                        marginRight: language === 'heb' ? '0' : '16px',
                        marginLeft: language === 'heb' ? '16px' : '0'
                    }}>
                        {dislikedArtists.length} {language === 'heb' ? 'דיסלייקים' : 'dislikes'}
                    </span>
                    <span style={{
                        color: '#5D4037',
                        textShadow: '0 0 8px #FFF8EF',
                        marginRight: language === 'heb' ? '0' : '16px',
                        marginLeft: language === 'heb' ? '16px' : '0'
                    }}>
                        {comments.filter(comment => !comment.deleted).length} {language === 'heb' ? 'תגובות' : 'comments'}
                    </span>
                    <span style={{
                        color: '#5D4037',
                        textShadow: '0 0 8px #FFF8EF'
                    }}>
                        {language === 'heb' ? 'הצטרף ב-' : 'joined'} {new Date(profileUser.createdAt).toLocaleDateString(language === 'heb' ? 'he-IL' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </span>
                </div>

                {/* Action buttons for own profile or admin */}
                {canDeleteUser && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '16px',
                        marginTop: '24px',
                        flexDirection: 'row'
                    }}>
                        {isOwnProfile && (
                            <button
                                onClick={() => setShowChangePasswordModal(true)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: 8,
                                    background: '#A15E0A',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#C1873B'}
                                onMouseOut={e => e.currentTarget.style.background = '#A15E0A'}
                            >
                                {language === 'heb' ? 'שינוי סיסמא' : 'Change Password'}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (isOwnProfile) {
                                    setShowDeleteAccountModal(true);
                                } else {
                                    setShowDeleteUserModal(true);
                                }
                            }}
                            style={{
                                padding: '10px 20px',
                                borderRadius: 8,
                                background: '#d32f2f',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#f44336'}
                            onMouseOut={e => e.currentTarget.style.background = '#d32f2f'}
                        >
                            {isOwnProfile
                                ? (language === 'heb' ? 'מחיקת חשבון' : 'Delete Account')
                                : (language === 'heb' ? 'מחק משתמש' : 'Delete User')
                            }
                        </button>
                    </div>
                )}
            </div>

            {/* Likes section */}
            <div style={{ maxWidth: '1400px', margin: '0 auto -12px auto', width: '100%' }}>
                <div style={{
                    background: 'transparent',
                    borderRadius: 16,
                    padding: 24,
                    width: '100%'
                }}>
                    <div style={{
                        textAlign: 'left',
                    }}>
                        <LikeIcon style={{
                            width: '3rem',
                            height: '3rem',
                            color: '#5D4037',
                            filter: 'drop-shadow(0 0 12px #FFF8EF)',
                            marginBottom: '32px',
                            display: 'inline-block',
                        }} />
                    </div>
                    <div style={{
                        display: 'grid',
                        marginLeft: '16px',
                        marginRight: '0',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        rowGap: '24px',
                        columnGap: '1px',
                        direction: 'ltr'
                    }}>
                        {likedArtists.map(artist => (
                            <Link
                                key={artist._id}
                                to={`/artist/${artist._id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <div className="shadow-[0_0_8px_0.5px_rgba(161,19,10,0.8)] rounded-2xl">
                                        <Avatar
                                            src={artist.image.url}
                                            className="w-20 h-20 [&>img]:object-top"
                                            fallback={artist.name[language].charAt(0)}
                                            radius="lg"
                                            isBordered
                                            color="danger"
                                        />
                                    </div>
                                    <span style={{
                                        color: '#5D4037',
                                        fontSize: '1.1rem',
                                        textShadow: '0 0 12px #FFF8EF',
                                        textAlign: 'center',
                                        direction: language === 'heb' ? 'rtl' : 'ltr',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '100px',
                                        display: 'block'
                                    }}>
                                        {trimParentheses(artist.name[language])}
                                    </span>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dislikes section */}
            <div style={{ maxWidth: '1400px', margin: '0 auto 32px auto', width: '100%' }}>
                <div style={{
                    background: 'transparent',
                    borderRadius: 16,
                    padding: 24,
                    width: '100%'
                }}>
                    <div style={{
                        textAlign: 'left',
                    }}>
                        <DislikeIcon style={{
                            width: '3rem',
                            height: '3rem',
                            color: '#5D4037',
                            filter: 'drop-shadow(0 0 12px #FFF8EF)',
                            marginBottom: '28px',
                            display: 'inline-block',
                        }} />
                    </div>
                    <div style={{
                        display: 'grid',
                        marginLeft: '16px',
                        marginRight: '0',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        rowGap: '24px',
                        columnGap: '1px',
                        direction: 'ltr'
                    }}>
                        {dislikedArtists.map(artist => (
                            <Link
                                key={artist._id}
                                to={`/artist/${artist._id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <div className="shadow-[0_0_8px_0.5px_rgba(161,19,10,0.8)] rounded-2xl">
                                        <Avatar
                                            src={artist.image.url}
                                            className="w-20 h-20 [&>img]:object-top"
                                            fallback={artist.name[language].charAt(0)}
                                            radius="lg"
                                            isBordered
                                            color="danger"
                                        />
                                    </div>
                                    <span style={{
                                        color: '#5D4037',
                                        fontSize: '1.1rem',
                                        textShadow: '0 0 12px #FFF8EF',
                                        textAlign: 'center',
                                        direction: language === 'heb' ? 'rtl' : 'ltr',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '100px',
                                        display: 'block'
                                    }}>
                                        {trimParentheses(artist.name[language])}
                                    </span>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Comments and Liked Comments sections side by side or stacked */}
            <div
                style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    width: '100%',
                    display: 'flex',
                    gap: '24px',
                    alignItems: 'flex-start',
                    flexDirection: isMobile ? 'column' : (language === 'eng' ? 'row' : 'row-reverse'),
                    opacity: 0.85
                }}
            >
                {/* User's Comments section */}
                <div style={{
                    flex: 1,
                    background: '#fff3e0',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px #0001',
                    padding: 24,
                    width: isMobile ? '100%' : '33.33%',
                    height: 'fit-content',
                    marginBottom: isMobile ? 16 : 0
                }}>
                    <h2 style={{
                        color: '#5D4037',
                        fontSize: '2rem',
                        marginBottom: '16px',
                        direction: language === 'heb' ? 'rtl' : 'ltr'
                    }}>
                        {language === 'heb' ? 'תגובות' : 'Comments'}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {getVisibleComments(comments, 'comments').map(comment => renderComment(comment, isOwnProfile))}
                    </div>
                    {isMobile && comments.filter(comment => !comment.deleted).length > showCount.comments && (
                        <div style={{ display: 'flex', justifyContent: language === 'heb' ? 'flex-end' : 'flex-start' }}>
                            <button
                                style={{
                                    marginTop: 12,
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    background: '#A15E0A',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    width: 'fit-content'
                                }}
                                onClick={() => setShowCount(sc => ({ ...sc, comments: sc.comments + 3 }))}
                                onMouseOver={e => e.currentTarget.style.background = '#C1873B'}
                                onMouseOut={e => e.currentTarget.style.background = '#A15E0A'}
                            >
                                {language === 'heb' ? 'טען עוד' : 'Load more'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Liked Comments section */}
                <div style={{
                    flex: 1,
                    background: '#fff3e0',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px #0001',
                    padding: 24,
                    width: isMobile ? '100%' : '33.33%',
                    height: 'fit-content',
                    opacity: 0.85,
                    marginBottom: isMobile ? 16 : 0
                }}>
                    <h2 style={{
                        color: '#5D4037',
                        fontSize: '2rem',
                        marginBottom: '16px',
                        direction: language === 'heb' ? 'rtl' : 'ltr'
                    }}>
                        {language === 'heb' ? 'תגובות שאהבתי' : 'Liked Comments'}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {getVisibleComments(likedComments, 'liked').map(comment => renderComment(comment, false))}
                    </div>
                    {isMobile && likedComments.filter(comment => !comment.deleted).length > showCount.liked && (
                        <div style={{ display: 'flex', justifyContent: language === 'heb' ? 'flex-end' : 'flex-start' }}>
                            <button
                                style={{
                                    marginTop: 12,
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    background: '#A15E0A',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    width: 'fit-content'
                                }}
                                onClick={() => setShowCount(sc => ({ ...sc, liked: sc.liked + 3 }))}
                                onMouseOver={e => e.currentTarget.style.background = '#C1873B'}
                                onMouseOut={e => e.currentTarget.style.background = '#A15E0A'}
                            >
                                {language === 'heb' ? 'טען עוד' : 'Load more'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Disliked Comments section */}
                <div style={{
                    flex: 1,
                    background: '#fff3e0',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px #0001',
                    padding: 24,
                    width: isMobile ? '100%' : '33.33%',
                    height: 'fit-content',
                    opacity: 0.85
                }}>
                    <h2 style={{
                        color: '#5D4037',
                        fontSize: '2rem',
                        marginBottom: '16px',
                        direction: language === 'heb' ? 'rtl' : 'ltr'
                    }}>
                        {language === 'heb' ? 'תגובות שלא אהבתי' : 'Disliked Comments'}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {getVisibleComments(dislikedComments, 'disliked').map(comment => renderComment(comment, false))}
                    </div>
                    {isMobile && dislikedComments.filter(comment => !comment.deleted).length > showCount.disliked && (
                        <div style={{ display: 'flex', justifyContent: language === 'heb' ? 'flex-end' : 'flex-start' }}>
                            <button
                                style={{
                                    marginTop: 12,
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    background: '#A15E0A',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    width: 'fit-content'
                                }}
                                onClick={() => setShowCount(sc => ({ ...sc, disliked: sc.disliked + 3 }))}
                                onMouseOver={e => e.currentTarget.style.background = '#C1873B'}
                                onMouseOut={e => e.currentTarget.style.background = '#A15E0A'}
                            >
                                {language === 'heb' ? 'טען עוד' : 'Load more'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ChangePasswordModal
                isOpen={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
                onSuccess={handlePasswordChangeSuccess}
            />
            <DeleteAccountModal
                isOpen={showDeleteAccountModal}
                onClose={() => setShowDeleteAccountModal(false)}
            />
            <DeleteUserModal
                user={profileUser}
                isOpen={showDeleteUserModal}
                onClose={() => setShowDeleteUserModal(false)}
                onSuccess={handleDeleteUserSuccess}
            />
        </div>
    );
};

export default ProfilePage; 