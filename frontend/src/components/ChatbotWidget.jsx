import React, { useState, useRef, useEffect } from 'react';
import { sendChatbotMessage } from '../api/chatbot';
import i18n from '../i18n';

const containerStyle = {
    position: 'fixed',
    right: '20px',
    bottom: '55px', // Lowered by another 0.3cm (7px)
    zIndex: 1000,
};

const panelStyle = {
    width: '320px',
    height: '420px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'absolute',
    bottom: '-14px', // Lowered by 0.5cm (14px)
    right: '0px'
};

const headerStyle = {
    padding: '12px 14px',
    background: '#111827',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const closeButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const bodyStyle = {
    flex: 1,
    padding: '12px',
    overflowY: 'auto',
    background: '#f9fafb'
};

const inputRowStyle = {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #e5e7eb',
    background: '#ffffff',
    alignItems: 'center'
};

const inputContainerStyle = {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center'
};

const inputStyle = {
    width: '100%',
    padding: '10px 45px 10px 12px', // Right padding for button space
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    outline: 'none',
    fontSize: '14px'
};

const btnStyle = {
    position: 'absolute',
    right: '5px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: 'none',
    background: '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
};

const bubbleUser = {
    alignSelf: 'flex-end',
    background: '#2563eb',
    color: '#ffffff',
    padding: '8px 10px',
    borderRadius: '12px',
    margin: '6px 0',
    maxWidth: '80%'
};

const bubbleBot = {
    alignSelf: 'flex-start',
    background: '#e5e7eb',
    color: '#111827',
    padding: '8px 10px',
    borderRadius: '12px',
    margin: '6px 0',
    maxWidth: '80%'
};

export default function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');

    // Get welcome message based on current language
    const getWelcomeMessage = () => {
        const currentLang = i18n.language || localStorage.getItem('language') || 'en';
        if (currentLang === 'ar') {
            return '👋 أهلاً بيك! أنا مساعدك الذكي في خدمتك.\nتقدر تسألني عن الخدمات، الطلبات، أو أي استفسار 😊';
        }
        return '👋 Welcome! I\'m here to help you.\nYou can ask me about services, orders, or any inquiries 😊';
    };

    const [messages, setMessages] = useState([
        { role: 'bot', text: getWelcomeMessage() }
    ]);
    const [loading, setLoading] = useState(false);
    const listRef = useRef(null);

    // Update welcome message when language changes
    useEffect(() => {
        const currentLang = i18n.language || localStorage.getItem('language') || 'en';
        const newWelcomeMessage = getWelcomeMessage();

        // Only update if the welcome message has changed
        setMessages(prevMessages => {
            if (prevMessages.length > 0 && prevMessages[0].role === 'bot') {
                const currentWelcome = prevMessages[0].text;
                if (currentWelcome !== newWelcomeMessage) {
                    return [{ role: 'bot', text: newWelcomeMessage }, ...prevMessages.slice(1)];
                }
            }
            return prevMessages;
        });
    }, [i18n.language]);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages, open]);

    // Add ESC key listener to close chat
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Escape' && open) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('keydown', handleKeyPress);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [open]);

    // Add click outside to close chat
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (open && !event.target.closest('.chatbot-widget')) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    async function handleSend(e) {
        e.preventDefault();
        const text = input.trim();
        if (!text || loading) return;

        setMessages(prev => [...prev, { role: 'user', text }]);
        setInput('');
        setLoading(true);
        try {
            const data = await sendChatbotMessage(text);
            const reply = data?.reply || 'Sorry, I had trouble responding.';
            setMessages(prev => [...prev, { role: 'bot', text: reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Network error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    }

    if (!open) {
        return (
            <div style={containerStyle}>
                <button style={{
                    ...btnStyle,
                    borderRadius: '50%',
                    width: 56,
                    height: 56,
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }} onClick={() => setOpen(true)}>
                    🤖
                </button>
            </div>
        );
    }

    return (
        <div style={containerStyle} className="chatbot-widget">
            <div style={panelStyle}>
                <div style={headerStyle}>
                    Assistant
                    <button style={closeButtonStyle} onClick={() => setOpen(false)}>
                        ×
                    </button>
                </div>
                <div style={{ ...bodyStyle, display: 'flex', flexDirection: 'column' }} ref={listRef}>
                    {messages.map((m, idx) => (
                        <div key={idx} style={m.role === 'user' ? bubbleUser : bubbleBot}>
                            {m.text.split('\n').map((line, lineIdx) => (
                                <div key={lineIdx}>{line}</div>
                            ))}
                        </div>
                    ))}
                    {loading && <div style={bubbleBot}>Thinking…</div>}
                </div>
                <form style={inputRowStyle} onSubmit={handleSend}>
                    <div style={inputContainerStyle}>
                        <input
                            style={inputStyle}
                            placeholder={i18n.language === 'ar' ? 'اكتب رسالة...' : 'Type a message'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" style={btnStyle} disabled={loading}>
                            ➤
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


