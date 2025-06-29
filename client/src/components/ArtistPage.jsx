import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import LikeIcon from '../assets/like-1385-svgrepo-com.svg?react';
import DislikeIcon from '../assets/dislike-1387-svgrepo-com.svg?react';
import { useAuth } from '@/context/authContext';
import { useLanguage } from '@/context/languageContext';
import CommentActions from './CommentActions';
import ArtistActionsArtistPage from './ArtistActionsArtistPage';
import CommentInput from './CommentInput';
import UpdateArtistModal from './UpdateArtistModal';
import DeleteArtistModal from './DeleteArtistModal';
import { Spinner, addToast, Button } from '@heroui/react';

const ICON_COLOR = "#A15E0A";
const ICON_HOVER_COLOR = "#C1873B";

// Helper function to detect if text is mainly Hebrew
function isMainlyHebrew(text) {
    if (!text) return false;
    const hebrewPattern = /[\u0590-\u05FF]/g;
    const hebrewChars = (text.match(hebrewPattern) || []).length;
    return hebrewChars > text.length * 0.5;
}

// Helper function to remove parentheses content (both English and Hebrew parentheses)
function removeParentheses(text) {
    if (!text) return text;
    // Remove content in English parentheses () and Hebrew parentheses ()
    return text.replace(/\([^)]*\)/g, '').replace(/\([^)]*\)/g, '').trim();
}

const iconStyle = {
    width: 40,
    height: 40,
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

const COMMENT_BACKGROUNDS = [
    '#fffef5',  // Original color
    '#fff8e1',  // Slightly warmer
    '#fff3e0',  // Warmer still
    '#ffecb3',  // Light amber
    '#ffe0b2'   // Light orange
];

function buildThreadedComments(comments) {
    // Sort comments by newest first
    const sortedComments = [...comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const map = {};
    const roots = [];
    sortedComments.forEach(c => {
        map[c._id] = { ...c, replies: [] };
    });
    sortedComments.forEach(c => {
        if (c.reply_to && map[c.reply_to]) {
            map[c.reply_to].replies.push(map[c._id]);
        } else {
            roots.push(map[c._id]);
        }
    });
    return roots;
}

function ThreadedComments({ comments, usersById, replyingToCommentId, setReplyingToCommentId, replyText, setReplyText, refreshComments, artistId, editingCommentId, setEditingCommentId, editText, setEditText, depth = 0, handleVoteChange }) {
    return (
        <div>
            {comments.map(comment => (
                <CommentThread
                    key={comment._id}
                    comment={comment}
                    usersById={usersById}
                    replyingToCommentId={replyingToCommentId}
                    setReplyingToCommentId={setReplyingToCommentId}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    refreshComments={refreshComments}
                    artistId={artistId}
                    editingCommentId={editingCommentId}
                    setEditingCommentId={setEditingCommentId}
                    editText={editText}
                    setEditText={setEditText}
                    depth={depth}
                    handleVoteChange={handleVoteChange}
                />
            ))}
        </div>
    );
}

function CommentThread({ comment, usersById, depth = 0, replyingToCommentId, setReplyingToCommentId, replyText, setReplyText, refreshComments, artistId, editingCommentId, setEditingCommentId, editText, setEditText, handleVoteChange }) {
    const user = usersById[comment.user] || {};
    const isReplying = replyingToCommentId === comment._id;
    const isEditing = editingCommentId === comment._id;
    const { user: currentUser } = useAuth();
    const isAuthor = currentUser && currentUser._id === comment.user;

    // Get background color based on depth
    const bgColor = COMMENT_BACKGROUNDS[depth % COMMENT_BACKGROUNDS.length];

    const handleEdit = async () => {
        if (!editText.trim()) return;
        const res = await fetch(`/comments/${comment._id}`, {
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
            if (refreshComments) refreshComments();
        }
    };

    const handleDelete = async () => {
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
                        const res = await fetch(`/comments/${comment._id}`, {
                            method: 'DELETE',
                            headers: {
                                'x-auth-token': localStorage.getItem('token'),
                            },
                        });
                        if (res.ok) {
                            if (refreshComments) refreshComments();
                        }
                    }}
                >
                    Confirm
                </Button>
            )
        });
    };

    return (
        <div style={{
            marginLeft: depth * 4,
            marginTop: 16,
            borderLeft: depth ? '2px solid #ffe0b2' : undefined,
            paddingLeft: 16,
            background: bgColor,
            borderRadius: 12,
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            padding: '16px',
            transition: 'box-shadow 0.2s',
            position: 'relative'
        }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                <Link
                    to={`/user/${comment.user}`}
                    style={{
                        color: '#5D4037',
                        textDecoration: 'none',
                        transition: 'color 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.color = '#A15E0A'}
                    onMouseOut={e => e.currentTarget.style.color = '#5D4037'}
                >
                    {user.username || 'Deleted User'}
                </Link>
                <span style={{ color: '#999', fontWeight: 400, fontSize: 12, marginLeft: 8 }}>{new Date(comment.createdAt).toLocaleString()}</span>
            </div>
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
                        onClick={handleEdit}
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
                <div style={{ margin: '8px 0', lineHeight: 1.5, fontSize: 14, color: '#333', whiteSpace: 'pre-line' }} dir={isMainlyHebrew(comment.text) ? 'rtl' : 'ltr'}>
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
                        onReplyClick={() => setReplyingToCommentId(isReplying ? null : comment._id)}
                        isReplying={isReplying}
                        onEditClick={() => {
                            if (isEditing) {
                                setEditingCommentId(null);
                                setEditText('');
                            } else {
                                setEditingCommentId(comment._id);
                                setEditText(comment.text);
                            }
                        }}
                        onDeleteClick={handleDelete}
                        isAuthor={isAuthor}
                        onVoteChange={handleVoteChange}
                    />
                </div>
            )}
            {isReplying && !comment.deleted && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'flex-start' }}>
                    <CommentInput
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onSubmit={async () => {
                            if (!replyText.trim()) return;
                            const res = await fetch('/comments', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'x-auth-token': localStorage.getItem('token'),
                                },
                                body: JSON.stringify({
                                    text: replyText,
                                    artist: artistId,
                                    reply_to: comment._id,
                                }),
                            });
                            if (res.ok) {
                                setReplyText('');
                                setReplyingToCommentId(null);
                                if (refreshComments) refreshComments();
                            }
                        }}
                        placeholder="Write your reply..."
                        dir={isMainlyHebrew(replyText) ? 'rtl' : 'ltr'}
                    />
                </div>
            )}
            {comment.replies && comment.replies.length > 0 && (
                <ThreadedComments
                    comments={comment.replies}
                    usersById={usersById}
                    replyingToCommentId={replyingToCommentId}
                    setReplyingToCommentId={setReplyingToCommentId}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    refreshComments={refreshComments}
                    artistId={artistId}
                    editingCommentId={editingCommentId}
                    setEditingCommentId={setEditingCommentId}
                    editText={editText}
                    setEditText={setEditText}
                    depth={depth + 1}
                    handleVoteChange={handleVoteChange}
                />
            )}
        </div>
    );
}

// Helper to get up to 150 words and add Wikipedia link if needed
function getSummaryWithWiki(summary, wiki, language) {
    if (!summary) return 'No summary available.';
    const words = summary.split(/\s+/);
    const isLong = words.length > 150;
    const displayed = isLong ? words.slice(0, 150).join(' ') + '...' : summary;
    let wikiUrl = wiki?.[language] || wiki?.[language === 'heb' ? 'eng' : 'heb'] || null;
    let wikiLabel = language === 'heb' ? ' ויקיפדיה' : 'wikipedia';
    return (
        <>
            {displayed}
            {wikiUrl && (
                <a href={wikiUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none', marginLeft: 4, fontWeight: 500 }}>
                    {wikiLabel}
                    <span style={{ fontFamily: 'FontAwesome', marginLeft: 4 }}> &#xf08e;</span>
                </a>
            )}
        </>
    );
}

const ArtistPage = () => {
    const { artistId } = useParams();
    const { user } = useAuth();
    const { language } = useLanguage();
    const [artist, setArtist] = useState(null);
    const [comments, setComments] = useState([]);
    const [usersById, setUsersById] = useState({});
    const [loading, setLoading] = useState(true);
    const [replyingToCommentId, setReplyingToCommentId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editText, setEditText] = useState('');
    const [newCommentText, setNewCommentText] = useState('');
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [areas, setAreas] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch artist
                const artistRes = await fetch(`/artists/${artistId}`);
                const artistData = await artistRes.json();
                setArtist(artistData);
                // Fetch comments
                const commentsRes = await fetch(`/comments/artist/${artistId}`);
                const commentsData = await commentsRes.json();
                setComments(commentsData);
                // Fetch users for comments
                const userIds = Array.from(new Set(commentsData.map(c => c.user)));
                const usersMap = {};
                await Promise.all(userIds.map(async (uid) => {
                    try {
                        const res = await fetch(`/users/${uid}`);
                        if (res.ok) {
                            const u = await res.json();
                            usersMap[uid] = u;
                        }
                    } catch { }
                }));
                setUsersById(usersMap);
            } finally {
                setLoading(false);
            }
        }
        if (artistId) fetchData();
    }, [artistId]);

    // Fetch areas for the update modal
    useEffect(() => {
        async function fetchAreas() {
            try {
                const areasRes = await fetch('/areas');
                const areasData = await areasRes.json();
                setAreas(areasData);
            } catch (error) {
                console.error('Error fetching areas:', error);
            }
        }
        fetchAreas();
    }, []);

    const threadedComments = useMemo(() => buildThreadedComments(comments), [comments]);

    // Add a function to refresh comments
    const refreshComments = async () => {
        const commentsRes = await fetch(`/comments/artist/${artistId}`);
        const commentsData = await commentsRes.json();
        setComments(commentsData);
        // Optionally update usersById if new users appear
        const userIds = Array.from(new Set(commentsData.map(c => c.user)));
        const usersMap = {};
        await Promise.all(userIds.map(async (uid) => {
            try {
                const res = await fetch(`/users/${uid}`);
                if (res.ok) {
                    const u = await res.json();
                    usersMap[uid] = u;
                }
            } catch { }
        }));
        setUsersById(usersMap);
    };

    // Function to refresh artist data after update
    const refreshArtist = async () => {
        try {
            const artistRes = await fetch(`/artists/${artistId}`);
            const artistData = await artistRes.json();
            setArtist(artistData);
        } catch (error) {
            console.error('Error refreshing artist:', error);
        }
    };

    // Function to handle vote changes and refresh comments
    const handleVoteChange = async (commentId, voteType) => {
        // Refresh comments to update vote counts
        await refreshComments();
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Spinner color="danger" size="lg" /></div>;
    if (!artist) return <div style={{ padding: 40, textAlign: 'center' }}>Artist not found.</div>;

    return (
        <>
            <style>{`
                @media (max-width: 768px) {
                    .artistpage-flex-row {
                        flex-direction: column !important;
                        gap: 0 !important;
                    }
                    .artistpage-spotify {
                        max-width: 100% !important;
                        margin-bottom: 24px;
                    }
                    .artistpage-title {
                        font-size: 2rem !important;
                    }
                    .artistpage-summary {
                        order: 2 !important;
                    }
                    .artistpage-actions {
                        order: 1 !important;
                        margin-top: -25px !important;
                    }
                }
            `}</style>
            <div style={{ minHeight: '100vh', padding: '24px 4vw' }}>
                {/* Admin Edit Button */}
                {user?.isAdmin && (
                    <div style={{
                        maxWidth: '1400px',
                        margin: '0 auto 24px auto',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '16px'
                    }}>
                        <button
                            onClick={() => setIsUpdateModalOpen(true)}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '8px',
                                background: '#A15E0A',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '400',
                                transition: 'background 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#C1873B'}
                            onMouseOut={e => e.currentTarget.style.background = '#A15E0A'}
                        >
                            {language === 'heb' ? 'ערוך אמן' : 'Edit Artist'}
                        </button>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '8px',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '400',
                                transition: 'background 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#c82333'}
                            onMouseOut={e => e.currentTarget.style.background = '#dc3545'}
                        >
                            {language === 'heb' ? 'מחק אמן' : 'Delete Artist'}
                        </button>
                    </div>
                )}

                {/* Top row: Spotify embed (left), summary+actions (right) */}
                <div className="artistpage-flex-row" style={{ display: 'flex', gap: 32, alignItems: 'stretch', maxWidth: '1400px', margin: '0 auto', height: 'auto', minHeight: 0 }}>
                    {/* Left: Spotify Embed */}
                    <div className="artistpage-spotify" style={{ flex: 1, maxWidth: '600px', minWidth: 0, display: 'flex', alignItems: 'stretch' }}>
                        {artist.spotifyId && (
                            <iframe
                                style={{ borderRadius: '12px', width: '100%', height: '100%', border: 'none', background: '#fff3e0', boxShadow: '0 2px 8px #0001', minHeight: 360 }}
                                src={`https://open.spotify.com/embed/artist/${artist.spotifyId}`}
                                frameBorder="0"
                                allowFullScreen=""
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                title="Spotify Artist Embed"
                            ></iframe>
                        )}
                    </div>
                    {/* Right: title (top), summary (center), actions (bottom) */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'flex-start' }}>
                        {/* Title div added here */}
                        <div className="artistpage-title" style={{
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            color: '#5d4037',
                            marginBottom: 16,
                            textAlign: 'center',
                            direction: language === 'heb' ? 'rtl' : 'ltr',
                            letterSpacing: '0.02em',
                            lineHeight: 1.1,
                            textShadow: '0 2px 8px #fff8ef',
                            wordBreak: 'break-word',
                        }}
                            dir={language === 'heb' ? 'rtl' : 'ltr'}
                        >
                            <span style={{ color: '#5d4037' }}>{removeParentheses(artist.name?.[language])}</span>
                            <span style={{ color: '#A88376' }}>{` — `}</span>
                            <span style={{ color: '#A88376' }}>{artist.location?.[language]}</span>
                        </div>
                        <div className="artistpage-summary" style={{ background: '#fff3e0', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, width: '100%', minHeight: 270, opacity: 0.85 }}>
                            <div style={{ color: '#5d4037', fontSize: 18 }}
                                dir={language === 'heb' ? 'rtl' : 'ltr'}>
                                {getSummaryWithWiki(artist.summary?.[language], artist.wiki, language)}
                            </div>
                        </div>
                        <div className="artistpage-actions">
                            <ArtistActionsArtistPage artistId={artist._id} />
                        </div>
                    </div>
                </div>
                {/* Comments full width below */}
                <div style={{ maxWidth: '1400px', margin: '32px auto 0 auto', width: '100%' }}>
                    <div style={{ background: 'transparent', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 24, width: '100%' }}>
                        {/* Only show comment input if user is logged in */}
                        {user && (
                            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start' }}>
                                <CommentInput
                                    value={newCommentText}
                                    onChange={e => setNewCommentText(e.target.value)}
                                    onSubmit={async () => {
                                        if (!newCommentText.trim()) return;
                                        const res = await fetch('/comments', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'x-auth-token': localStorage.getItem('token'),
                                            },
                                            body: JSON.stringify({
                                                text: newCommentText,
                                                artist: artistId,
                                                user: user._id
                                            }),
                                        });
                                        if (res.ok) {
                                            setNewCommentText('');
                                            refreshComments();
                                        }
                                    }}
                                    placeholder="Write a comment..."
                                    dir={isMainlyHebrew(newCommentText) ? 'rtl' : 'ltr'}
                                />
                            </div>
                        )}
                        <ThreadedComments
                            comments={threadedComments}
                            usersById={usersById}
                            replyingToCommentId={replyingToCommentId}
                            setReplyingToCommentId={setReplyingToCommentId}
                            replyText={replyText}
                            setReplyText={setReplyText}
                            refreshComments={refreshComments}
                            artistId={artist?._id}
                            editingCommentId={editingCommentId}
                            setEditingCommentId={setEditingCommentId}
                            editText={editText}
                            setEditText={setEditText}
                            handleVoteChange={handleVoteChange}
                        />
                    </div>
                </div>
            </div>

            {/* Update Artist Modal */}
            <UpdateArtistModal
                artist={artist}
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                onSuccess={() => {
                    setIsUpdateModalOpen(false);
                    refreshArtist();
                }}
                areas={areas}
            />

            {/* Delete Artist Modal */}
            <DeleteArtistModal
                artist={artist}
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onSuccess={() => {
                    setIsDeleteModalOpen(false);
                    // Redirect to home page after successful deletion
                    window.location.href = '/';
                }}
            />
        </>
    );
};

export default ArtistPage;