import React, { useState, useRef, useEffect } from 'react';
import { sendChatbotMessage } from '../api/chatbot';
import i18n from '../i18n';

export default function ChatbotWidget() {
    const containerStyle = {
        position: 'fixed',
        right: '20px',
        bottom: '55px',
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
        bottom: '-14px',
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

    const centerTextStyle = {
        flex: 1,
        textAlign: 'center',
        fontWeight: 600,
        fontSize: '14px'
    };

    const navButtonStyle = {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        border: 'none',
        background: '#374151',
        color: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        transition: 'background-color 0.2s'
    };

    const navButtonsStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
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
        padding: '10px 45px 10px 12px',
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
        background: '#60a5fa',
        color: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(96, 165, 250, 0.4)'
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

    const formatMessage = (text, currentLang = 'ar') => {
        if (text && typeof text === 'object' && text.ar && text.en) {
            text = currentLang === 'ar' ? text.ar : text.en;
        }

        if (typeof text !== 'string') {
            text = String(text);
        }

        return text.split('\n').map((line, idx) => {
            if (line.includes("support@khadamatak.com")) {
                return (
                    <div key={idx}>
                        📧: <span style={{ fontSize: "12px" }}>support@khadamatak.com</span>
                    </div>
                );
            }
            if (line.includes("www.khadamatak.com/register")) {
                return (
                    <div key={idx}>
                        🌐: <a href="http://localhost:5173/auth" style={{ fontSize: "12px", color: "#2563eb" }}>
                            www.khadamatak.com/register
                        </a>
                    </div>
                );
            }
            if (line.includes("www.khadamatak.com/login")) {
                return (
                    <div key={idx}>
                        🌐: <a href="http://localhost:5173/auth" style={{ fontSize: "12px", color: "#2563eb" }}>
                            www.khadamatak.com/login
                        </a>
                    </div>
                );
            }
            if (line.includes("www.khadamatak.com")) {
                return (
                    <div key={idx}>
                        🌐: <a href="https://www.khadamatak.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#2563eb" }}>
                            www.khadamatak.com
                        </a>
                    </div>
                );
            }
            if (line.includes("facebook.com/khadamatak")) {
                return (
                    <div key={idx}>
                        ⓕ: <a href="https://facebook.com/khadamatak" target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#2563eb" }}>
                            facebook.com/khadamatak
                        </a>
                    </div>
                );
            }
            if (line.includes("🅾انستجرام: instagram.com/khadamatak") || line.includes("🅾Instagram: instagram.com/khadamatak")) {
                return (
                    <div key={idx}>
                        🅾:<a href="https://instagram.com/khadmatak" target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#2563eb" }}>
                            instagram.com/khadmatak
                        </a>
                    </div>
                );
            }
            if (line.includes("instagram.com/khadamatak")) {
                return (
                    <div key={idx}>
                        🅾:<a href="https://instagram.com/khadamatak" target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#2563eb" }}>
                            instagram.com/khadamatak
                        </a>
                    </div>
                );
            }
            if (line.includes("twitter.com/khadamatak")) {
                return (
                    <div key={idx}>
                        𝕏: <a href="https://twitter.com/khadamatak" target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#2563eb" }}>
                            twitter.com/khadamatak
                        </a>
                    </div>
                );
            }
            if (line.includes("youtube.com/khadamatak")) {
                return (
                    <div key={idx}>
                        ▶: <a href="https://youtube.com/khadamatak" target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#2563eb" }}>
                            youtube.com/khadamatak
                        </a>
                    </div>
                );
            }
            return <div key={idx}>{line}</div>;
        });
    };

    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [currentState, setCurrentState] = useState('start');
    const [stateHistory, setStateHistory] = useState(['start']);
    const [currentLang, setCurrentLang] = useState('ar');
    const chatPanelRef = useRef(null);
    const inputRef = useRef(null);
    const getCurrentLanguage = () => {
        return i18n.language || localStorage.getItem('language') || 'ar';
    };

    const getWelcomeMessage = (lang) => {
        if (lang === 'ar') {
            return "👋 أهلاً وسهلاً 👋\nاختر من الخيارات التالية:\n\n1️⃣ الخدمات المتاحة\n2️⃣ تسجيل دخول\n3️⃣ عروض وخصومات\n4️⃣ عن الشركة\n5️⃣ التواصل مع الدعم\n6️⃣ خدماتك سوشال";
        } else {
            return "👋 Welcome! 👋\nChoose from the following\n\n1️⃣ Available Services\n2️⃣ Sign up / Login\n3️⃣ Offers & Discounts\n4️⃣ About us\n5️⃣ Contact Support\n6️⃣ Social Media";
        }
    };

    const [messages, setMessages] = useState([
        { role: 'bot', text: getWelcomeMessage(getCurrentLanguage()) }
    ]);
    const [loading, setLoading] = useState(false);
    const listRef = useRef(null);

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && open) {
                setOpen(false);
            }
        };

        const handleClickOutside = (event) => {
            if (open && chatPanelRef.current && !chatPanelRef.current.contains(event.target)) {
                const chatButton = document.querySelector('.chatbot-button');
                if (!chatButton || !chatButton.contains(event.target)) {
                    setOpen(false);
                }
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open, messages]);

    useEffect(() => {
        const lang = getCurrentLanguage();
        setCurrentLang(lang);
    }, [i18n.language]);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages, open]);

    const goBack = async () => {
        if (stateHistory.length > 1) {
            const previousState = stateHistory[stateHistory.length - 2];
            setStateHistory(prev => prev.slice(0, -1));
            setCurrentState(previousState);

            try {
                const backCommand = currentLang === 'ar' ? 'عودة' : 'back';
                const data = await sendChatbotMessage(backCommand, currentLang, previousState);

                let replyText = data?.reply;
                if (replyText && typeof replyText === 'object' && replyText.ar && replyText.en) {
                    replyText = currentLang === 'ar' ? replyText.ar : replyText.en;
                }

                setMessages(prev => [...prev, { role: 'bot', text: replyText || (currentLang === 'ar' ? 'تم الرجوع للخطوة السابقة' : 'Returned to previous step') }]);
            } catch (err) {
                const errorMsg = currentLang === 'ar' ? 'تم الرجوع للخطوة السابقة' : 'Returned to previous step';
                setMessages(prev => [...prev, { role: 'bot', text: errorMsg }]);
            }
        }
    };

    const goToMainMenu = async () => {
        setCurrentState('start');
        setStateHistory(['start']);
        const lang = getCurrentLanguage();
        setMessages([{ role: 'bot', text: getWelcomeMessage(lang) }]);
    };

    async function handleSend(e) {
        e.preventDefault();
        const text = input.trim();
        if (!text || loading) return;

        setMessages(prev => [...prev, { role: 'user', text }]);
        setInput('');
        setLoading(true);
        try {
            const data = await sendChatbotMessage(text, currentLang, currentState);

            let replyText = data?.reply;
            if (replyText && typeof replyText === 'object' && replyText.ar && replyText.en) {
                replyText = currentLang === 'ar' ? replyText.ar : replyText.en;
            }

            const nextState = data?.next_state || 'start';

            setMessages(prev => [...prev, { role: 'bot', text: replyText || (currentLang === 'ar' ? 'عذراً، حدث خطأ في الرد' : 'Sorry, I had trouble responding.') }]);
            setCurrentState(nextState);

            if (nextState !== 'start' && nextState !== currentState) {
                setStateHistory(prev => [...prev, nextState]);
            } else if (nextState === 'start') {
                setStateHistory(['start']);
            }
        } catch (err) {
            const errorMsg = currentLang === 'ar' ? 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.' : 'Network error. Please try again.';
            setMessages(prev => [...prev, { role: 'bot', text: errorMsg }]);
        } finally {
            setLoading(false);
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }

    if (!open) {
        return (
            <div style={containerStyle}>
                <button
                    className="chatbot-button"
                    style={{
                        ...btnStyle,
                        borderRadius: '50%',
                        width: 56,
                        height: 56,
                        fontSize: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#60a5fa',
                        boxShadow: '0 6px 20px rgba(96, 165, 250, 0.5)'
                    }}
                    onClick={() => {
                        const lang = getCurrentLanguage();
                        setCurrentLang(lang);
                        setOpen(true);
                        setCurrentState('start');
                        setStateHistory(['start']);
                        setMessages([{ role: 'bot', text: getWelcomeMessage(lang) }]);
                    }}
                >
                    🤖
                </button>
            </div>
        );
    }

    return (
        <div style={containerStyle} className="chatbot-widget">
            <div style={panelStyle} ref={chatPanelRef}>
                <div style={headerStyle}>
                    <div style={navButtonsStyle}>
                        <button
                            style={{
                                ...navButtonStyle,
                                background: currentState !== 'start' ? '#374151' : '#1f2937',
                                cursor: currentState !== 'start' ? 'pointer' : 'not-allowed'
                            }}
                            onClick={goToMainMenu}
                            disabled={currentState === 'start'}
                            title={currentLang === 'ar' ? "العودة للقائمة الرئيسية" : "Back to main menu"}
                        >
                            ☰
                        </button>
                        <button
                            style={{
                                ...navButtonStyle,
                                background: stateHistory.length > 1 ? '#374151' : '#1f2937',
                                cursor: stateHistory.length > 1 ? 'pointer' : 'not-allowed'
                            }}
                            onClick={goBack}
                            disabled={stateHistory.length <= 1}
                            title={currentLang === 'ar' ? "الرجوع للخطوة السابقة" : "Back to previous step"}
                        >
                            🢘
                        </button>
                    </div>
                    <span style={centerTextStyle}>{currentLang === 'ar' ? "المساعد" : "Assistant"}</span>
                    <button style={closeButtonStyle} onClick={() => setOpen(false)}>
                        ×
                    </button>
                </div>
                <div style={{ ...bodyStyle, display: 'flex', flexDirection: 'column' }} ref={listRef}>
                    {messages.map((m, idx) => (
                        <div key={idx} style={m.role === 'user' ? bubbleUser : bubbleBot}>
                            {formatMessage(m.text, currentLang)}
                        </div>
                    ))}
                    {loading && <div style={bubbleBot}>{currentLang === 'ar' ? "جاري التفكير…" : "Thinking…"}</div>}
                </div>
                <form style={inputRowStyle} onSubmit={handleSend}>
                    <div style={inputContainerStyle}>
                        <input
                            ref={inputRef}
                            style={inputStyle}
                            placeholder={currentLang === 'ar' ? 'اكتب رسالة...' : 'Type a message...'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            autoFocus
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