import React, { useState, useRef, useEffect } from 'react';

const MAX_ROWS = 8;
const LINE_HEIGHT = 20; // Approximate line height in pixels

export default function CommentInput({ value, onChange, onSubmit, placeholder, dir }) {
    const textareaRef = useRef(null);
    const [rows, setRows] = useState(1);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';

        // Calculate the number of lines
        const scrollHeight = textarea.scrollHeight;
        const newRows = Math.min(Math.ceil(scrollHeight / LINE_HEIGHT), MAX_ROWS);

        // Set the height based on the number of rows
        if (newRows <= MAX_ROWS) {
            textarea.style.height = `${newRows * LINE_HEIGHT}px`;
            setRows(newRows);
        } else {
            textarea.style.height = `${MAX_ROWS * LINE_HEIGHT}px`;
            setRows(MAX_ROWS);
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                dir={dir}
                rows={1}
                style={{
                    width: '100%',
                    padding: '10px 14px',
                    paddingBottom: '40px', // Make room for the submit button
                    borderRadius: 8,
                    border: '1px solid #ccc',
                    fontSize: 14,
                    outline: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'border-color 0.2s',
                    resize: 'none',
                    overflowY: rows >= MAX_ROWS ? 'auto' : 'hidden',
                    minHeight: `${LINE_HEIGHT}px`,
                    maxHeight: `${MAX_ROWS * LINE_HEIGHT}px`,
                    lineHeight: `${LINE_HEIGHT}px`
                }}
                onMouseOver={e => e.target.style.borderColor = '#A15E0A'}
                onMouseOut={e => e.target.style.borderColor = '#ccc'}
            />
            <button
                onClick={onSubmit}
                style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    padding: '4px 8px',
                    background: 'none',
                    color: '#A15E0A',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    fontSize: '16px',
                    fontWeight: 400
                }}
                onMouseOver={e => e.currentTarget.style.color = '#C1873B'}
                onMouseOut={e => e.currentTarget.style.color = '#A15E0A'}
            >
                Submit
            </button>
        </div>
    );
} 