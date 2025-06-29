import React, { useState } from 'react';
import { useLanguage } from '../context/languageContext';

function isMainlyHebrew(text) {
    if (!text) return false;
    const hebrewPattern = /[\u0590-\u05FF]/g;
    const hebrewChars = (text.match(hebrewPattern) || []).length;
    return hebrewChars > text.length * 0.5;
}

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

const textareaStyle = {
    ...inputStyle,
    minHeight: 80,
    resize: 'vertical',
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
};

const translations = {
    name: { heb: 'שם', eng: 'Name' },
    email: { heb: 'אימייל', eng: 'Email' },
    message: { heb: 'הודעה', eng: 'Message' },
    contactUs: { heb: 'צור קשר', eng: 'Contact Us' },
    send: { heb: 'שלח', eng: 'Send' },
    sending: { heb: 'שולח...', eng: 'Sending...' },
    sent: { heb: 'ההודעה נשלחה!', eng: 'Message sent!' },
    failed: { heb: 'שליחה נכשלה.', eng: 'Failed to send.' },
};

function Contact() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const { language } = useLanguage();

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setStatus('');
        try {
            const res = await fetch('/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('sent');
                setForm({ name: '', email: '', message: '' });
            } else {
                setStatus('failed');
            }
        } catch {
            setStatus('failed');
        } finally {
            setLoading(false);
        }
    };

    // Label alignment for Hebrew
    const labelStyle = language === 'heb' ? { ...labelBaseStyle, textAlign: 'right', direction: 'rtl' } : labelBaseStyle;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleSubmit} style={formContainerStyle}>
                <h2 style={{ color: '#A15E0A', marginBottom: 12, fontWeight: 500, fontSize: 24, textAlign: 'center' }}>
                    {translations.contactUs[language]}
                </h2>
                <label style={labelStyle} htmlFor="name">{translations.name[language]}</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    style={{ ...inputStyle, direction: isMainlyHebrew(form.name) ? 'rtl' : 'ltr', textAlign: isMainlyHebrew(form.name) ? 'right' : 'left' }}
                    required
                />
                <label style={labelStyle} htmlFor="email">{translations.email[language]}</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                />
                <label style={labelStyle} htmlFor="message">{translations.message[language]}</label>
                <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    style={{ ...textareaStyle, direction: isMainlyHebrew(form.message) ? 'rtl' : 'ltr', textAlign: isMainlyHebrew(form.message) ? 'right' : 'left' }}
                    required
                />
                <button type="submit" style={{
                    ...buttonStyle,
                    direction: language === 'heb' ? 'rtl' : 'ltr',
                    textAlign: 'center'
                }} disabled={loading} onMouseOver={e => e.currentTarget.style.background = '#C1873B'} onMouseOut={e => e.currentTarget.style.background = '#A15E0A'}>
                    {loading ? translations.sending[language] : translations.send[language]}
                </button>
                {status && (
                    <div style={{ marginTop: 10, color: status === 'sent' ? 'green' : 'red', fontWeight: 500, direction: language === 'heb' ? 'rtl' : 'ltr', textAlign: language === 'heb' ? 'right' : 'left' }}>
                        {status === 'sent' ? translations.sent[language] : translations.failed[language]}
                    </div>
                )}
            </form>
        </div>
    );
}

export default Contact; 