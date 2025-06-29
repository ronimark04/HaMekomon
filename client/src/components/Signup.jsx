import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Input,
    Button,
} from "@heroui/react";
import { useAuth } from '../context/authContext';
import { useLanguage } from '../context/languageContext';

// Helper function to detect if text is mainly Hebrew
function isMainlyHebrew(text) {
    if (!text) return false;
    const hebrewPattern = /[\u0590-\u05FF]/g;
    const hebrewChars = (text.match(hebrewPattern) || []).length;
    return hebrewChars > text.length * 0.5;
}

const translations = {
    signupTitle: { heb: 'הרשמה', eng: 'Sign Up' },
    signupSubtitle: { heb: 'צור חשבון חדש', eng: 'Create your account' },
    username: { heb: 'שם משתמש', eng: 'Username' },
    email: { heb: 'אימייל', eng: 'Email' },
    password: { heb: 'סיסמה', eng: 'Password' },
    confirmPassword: { heb: 'אימות סיסמה', eng: 'Confirm Password' },
    cancel: { heb: 'ביטול', eng: 'Cancel' },
    signup: { heb: 'הרשמה', eng: 'Sign Up' },
    passwordsNoMatch: { heb: 'הסיסמאות אינן תואמות', eng: 'Passwords do not match' },
    registrationFailed: { heb: 'ההרשמה נכשלה. נסה שוב.', eng: 'Registration failed. Please try again.' },
    usernameInvalid: {
        heb: 'שם המשתמש חייב להתחיל באות באנגלית ויכול להכיל רק אותיות באנגלית, מספרים וקווים תחתונים (3-16 תווים)',
        eng: 'Username must start with a letter and can only contain English letters, numbers, and underscores (3-16 characters)'
    },
    usernameTooShort: { heb: 'שם המשתמש חייב להיות לפחות 3 תווים', eng: 'Username must be at least 3 characters long' },
    usernameTooLong: { heb: 'שם המשתמש לא יכול להיות יותר מ-16 תווים', eng: 'Username cannot be more than 16 characters long' },
    usernameTaken: { heb: 'שם המשתמש הזה כבר תפוס. אנא בחר שם משתמש אחר.', eng: 'This username is already taken. Please choose a different username.' },
    passwordRequirements: {
        heb: 'הסיסמה חייבת להיות באורך 8 תווים לפחות, לכלול אות גדולה, אות קטנה, מספר ותו מיוחד (!@#$%^&*-)',
        eng: 'Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and one special character (!@#$%^&*-)',
    },
};

// Add styles from Contact.jsx
const formContainerStyle = {
    background: '#fff8e1',
    opacity: 0.85,
    borderRadius: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    padding: 32,
    maxWidth: 540,
    width: '100%',
    margin: '40px auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
};

const labelBaseStyle = {
    fontWeight: 600,
    color: '#5D4037',
    marginBottom: 1,
};

const inputStyle = {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 15,
    outline: 'none',
    marginBottom: 6,
};

const buttonStyle = {
    padding: '12px 0',
    borderRadius: 8,
    background: '#A15E0A',
    color: 'white',
    border: 'none',
    fontWeight: 600,
    fontSize: 16,
    cursor: 'pointer',
    transition: 'background 0.2s',
    minWidth: 100,
};

export default function Signup() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const { language } = useLanguage();

    // Username validation function
    const validateUsername = (username) => {
        if (username.length < 3) {
            return translations.usernameTooShort[language];
        }
        if (username.length > 16) {
            return translations.usernameTooLong[language];
        }
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(username)) {
            return translations.usernameInvalid[language];
        }
        return null;
    };

    // Password validation function
    const validatePassword = (password) => {
        // At least 8 characters, one uppercase, one lowercase, one number, one special character
        const regex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*-]).{8,20}$/;
        if (!regex.test(password)) {
            return translations.passwordRequirements[language];
        }
        return null;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        if (e.target.name === 'username') {
            setUsernameError('');
        }
        // Clear password error when user starts typing
        if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
            setPasswordError('');
        }
    };

    const handleUsernameBlur = () => {
        if (formData.username) {
            const error = validateUsername(formData.username);
            setUsernameError(error || '');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPasswordError('');
        setIsLoading(true);

        // Username validation (errors appear at the top)
        const usernameValidationError = validateUsername(formData.username);
        if (usernameValidationError) {
            setError(usernameValidationError);
            setIsLoading(false);
            return;
        }

        // Password validation (errors appear below the password fields)
        const passwordValidationError = validatePassword(formData.password);
        if (passwordValidationError) {
            setPasswordError(passwordValidationError);
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setPasswordError(translations.passwordsNoMatch[language]);
            setIsLoading(false);
            return;
        }

        try {
            const result = await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            navigate('/');
        } catch (err) {
            if (err.message && err.message.includes('username is already taken')) {
                setError(translations.usernameTaken[language]);
            } else if (err.message && (err.message.includes('password') || err.message.includes('fails to match the required pattern'))) {
                setPasswordError(translations.passwordRequirements[language]);
            } else {
                setError(err.message || translations.registrationFailed[language]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Set direction and text alignment based on language
    const dir = language === 'heb' ? 'rtl' : 'ltr';
    const textAlign = language === 'heb' ? 'right' : 'left';
    const labelStyle = language === 'heb' ? { ...labelBaseStyle, textAlign: 'right', direction: 'rtl' } : labelBaseStyle;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleSubmit} style={{ ...formContainerStyle, direction: dir, textAlign }}>
                <h2 style={{ color: '#A15E0A', fontWeight: 500, fontSize: 24, textAlign: 'center' }}>
                    {translations.signupTitle[language]}
                </h2>
                <p style={{ color: '#5D4037', marginBottom: 18, fontSize: 16, textAlign: 'center' }}>
                    {translations.signupSubtitle[language]}
                </p>
                {error && (
                    <div style={{ color: 'red', marginBottom: 12, fontWeight: 500, direction: dir, textAlign }}>{error}</div>
                )}
                <label style={labelStyle} htmlFor="username">{translations.username[language]}</label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleUsernameBlur}
                    placeholder={language === 'heb' ? 'לדוגמה: john_doe123' : 'e.g., john_doe123'}
                    style={{
                        ...inputStyle,
                        direction: 'ltr',
                        textAlign: 'left',
                        border: usernameError ? '1px solid #ef4444' : '1px solid #ccc'
                    }}
                    required
                    disabled={isLoading}
                />
                {usernameError && (
                    <div style={{ color: 'red', marginBottom: 12, fontWeight: 500, direction: dir, textAlign }}>{usernameError}</div>
                )}
                <label style={labelStyle} htmlFor="email">{translations.email[language]}</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }}
                    required
                    disabled={isLoading}
                />
                <label style={labelStyle} htmlFor="password">{translations.password[language]}</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }}
                    required
                    disabled={isLoading}
                />
                <label style={labelStyle} htmlFor="confirmPassword">{translations.confirmPassword[language]}</label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }}
                    required
                    disabled={isLoading}
                />
                {passwordError && (
                    <div style={{ color: 'red', marginTop: 4, marginBottom: 12, fontWeight: 500, direction: dir, textAlign }}>{passwordError}</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
                    <button
                        type="button"
                        style={{ ...buttonStyle, background: 'transparent', color: '#A15E0A', border: '1px solid #A15E0A' }}
                        onClick={() => navigate('/')}
                        disabled={isLoading}
                        onMouseOver={e => e.currentTarget.style.background = '#FFF3E0'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                        {translations.cancel[language]}
                    </button>
                    <button
                        type="submit"
                        style={buttonStyle}
                        disabled={isLoading}
                        onMouseOver={e => e.currentTarget.style.background = '#C1873B'}
                        onMouseOut={e => e.currentTarget.style.background = '#A15E0A'}
                    >
                        {isLoading ? '...' : translations.signup[language]}
                    </button>
                </div>
            </form>
        </div>
    );
} 