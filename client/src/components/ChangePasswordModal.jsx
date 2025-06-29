import React, { useState } from 'react';
import { useLanguage } from '@/context/languageContext';
import { useAuth } from '@/context/authContext';

const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
    const { language } = useLanguage();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    // Password validation function (same as Signup.jsx)
    const validatePassword = (password) => {
        // At least 8 characters, one uppercase, one lowercase, one number, one special character
        const regex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*-]).{8,20}$/;
        if (!regex.test(password)) {
            return language === 'heb'
                ? 'הסיסמה חייבת להיות באורך 8 תווים לפחות, לכלול אות גדולה, אות קטנה, מספר ותו מיוחד (!@#$%^&*-)'
                : 'Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and one special character (!@#$%^&*-)';
        }
        return null;
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user starts typing
        // Clear password error when user starts typing in password fields
        if (e.target.name === 'newPassword' || e.target.name === 'confirmPassword') {
            setPasswordError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPasswordError('');
        setLoading(true);

        // Validation
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setError(language === 'heb' ? 'כל השדות נדרשים' : 'All fields are required');
            setLoading(false);
            return;
        }

        // Password validation (same as Signup.jsx)
        const passwordValidationError = validatePassword(formData.newPassword);
        if (passwordValidationError) {
            setPasswordError(passwordValidationError);
            setLoading(false);
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setPasswordError(language === 'heb' ? 'הסיסמאות החדשות אינן תואמות' : 'New passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/users/${user._id}/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token'),
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to change password');
            }

            // Success
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            onSuccess();
            onClose();
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
                maxWidth: 400,
                width: '90%',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                direction: language === 'heb' ? 'rtl' : 'ltr'
            }}>
                <h2 style={{
                    color: '#5D4037',
                    fontSize: '1.8rem',
                    marginBottom: 24,
                    textAlign: 'center'
                }}>
                    {language === 'heb' ? 'שינוי סיסמא' : 'Change Password'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            color: '#5D4037'
                        }}>
                            {language === 'heb' ? 'סיסמה נוכחית' : 'Current Password'}
                        </label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: 12,
                                borderRadius: 8,
                                border: '1px solid #ccc',
                                fontSize: 14,
                                outline: 'none',
                                boxSizing: 'border-box',
                                direction: 'ltr'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            color: '#5D4037'
                        }}>
                            {language === 'heb' ? 'סיסמה חדשה' : 'New Password'}
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: 12,
                                borderRadius: 8,
                                border: '1px solid #ccc',
                                fontSize: 14,
                                outline: 'none',
                                boxSizing: 'border-box',
                                direction: 'ltr'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            color: '#5D4037'
                        }}>
                            {language === 'heb' ? 'אימות סיסמה חדשה' : 'Confirm New Password'}
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: 12,
                                borderRadius: 8,
                                border: '1px solid #ccc',
                                fontSize: 14,
                                outline: 'none',
                                boxSizing: 'border-box',
                                direction: 'ltr'
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

                    {passwordError && (
                        <div style={{
                            color: '#d32f2f',
                            backgroundColor: '#ffebee',
                            padding: 12,
                            borderRadius: 8,
                            marginBottom: 16,
                            fontSize: 14
                        }}>
                            {passwordError}
                        </div>
                    )}

                    <div style={{
                        display: 'flex',
                        gap: 12,
                        justifyContent: 'center'
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
                                background: loading ? '#ccc' : '#A15E0A',
                                color: 'white',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: 14
                            }}
                            onMouseOver={e => !loading && (e.currentTarget.style.background = '#C1873B')}
                            onMouseOut={e => !loading && (e.currentTarget.style.background = '#A15E0A')}
                        >
                            {loading ? (language === 'heb' ? 'מעדכן...' : 'Updating...') : (language === 'heb' ? 'עדכן סיסמא' : 'Update Password')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal; 