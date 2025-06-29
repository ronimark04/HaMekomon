import React, { useState } from 'react';
import { useLanguage } from '@/context/languageContext';
import { useAuth } from '@/context/authContext';
import { useNavigate } from 'react-router-dom';

const DeleteAccountModal = ({ isOpen, onClose }) => {
    const { language } = useLanguage();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setPassword(e.target.value);
        setError(''); // Clear error when user starts typing
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!password) {
            setError(language === 'heb' ? 'סיסמה נדרשת' : 'Password is required');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/users/${user._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token'),
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete account');
            }

            // Success - logout and redirect to home
            logout();
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: '#fff3e0',
                borderRadius: 16,
                padding: 32,
                maxWidth: 450,
                width: '90%',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                direction: language === 'heb' ? 'rtl' : 'ltr'
            }}>
                <h2 style={{
                    color: '#d32f2f',
                    fontSize: '1.8rem',
                    marginBottom: 16,
                    textAlign: 'center'
                }}>
                    {language === 'heb' ? 'מחיקת חשבון' : 'Delete Account'}
                </h2>

                <div style={{
                    color: '#5D4037',
                    fontSize: 16,
                    marginBottom: 24,
                    textAlign: 'center',
                    lineHeight: 1.5
                }}>
                    {language === 'heb'
                        ? 'פעולה זו תמחק את החשבון שלך לצמיתות. כל הנתונים שלך יאבדו ולא ניתן יהיה לשחזר אותם.'
                        : 'This action will permanently delete your account. All your data will be lost and cannot be recovered.'
                    }
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            color: '#5D4037',
                            fontWeight: 'bold'
                        }}>
                            {language === 'heb' ? 'הזן סיסמה לאישור' : 'Enter password to confirm'}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: 12,
                                borderRadius: 8,
                                border: '1px solid #ccc',
                                fontSize: 14,
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: '#d32f2f',
                            backgroundColor: '#ffebee',
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 16,
                            fontSize: 14
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{
                        display: 'flex',
                        gap: 12,
                        justifyContent: 'center',
                        flexDirection: language === 'heb' ? 'row-reverse' : 'row'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '12px 24px',
                                borderRadius: 8,
                                background: '#ccc',
                                color: '#333',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 14
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#bbb'}
                            onMouseOut={e => e.currentTarget.style.background = '#ccc'}
                        >
                            {language === 'heb' ? 'ביטול' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                borderRadius: 8,
                                background: loading ? '#ccc' : '#d32f2f',
                                color: 'white',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: 14
                            }}
                            onMouseOver={e => !loading && (e.currentTarget.style.background = '#f44336')}
                            onMouseOut={e => !loading && (e.currentTarget.style.background = '#d32f2f')}
                        >
                            {loading ? (language === 'heb' ? 'מוחק...' : 'Deleting...') : (language === 'heb' ? 'מחק חשבון' : 'Delete Account')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeleteAccountModal; 