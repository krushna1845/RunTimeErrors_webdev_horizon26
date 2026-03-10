import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X } from 'lucide-react';
import { sendChatMessage } from '../../lib/api';

const GREETING = "Hi! I'm OpsPulse AI, your Business Operations Assistant. Ask me about your sales, inventory, or business stress score.";

export default function ChatbotDrawer({ onClose }) {
    const [messages, setMessages] = useState([
        { role: 'bot', text: GREETING, time: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async () => {
        if (!input.trim() || loading) return;
        const text = input.trim();
        const userMsg = { role: 'user', text, time: new Date() };
        setMessages(p => [...p, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const data = await sendChatMessage(text);
            const botMsg = { role: 'bot', text: data.reply, time: new Date() };
            setMessages(p => [...p, botMsg]);
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(p => [...p, {
                role: 'bot',
                text: "I'm having trouble connecting right now. Please try again in a moment.",
                time: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
                position: 'fixed', right: 0, top: 0, bottom: 0,
                width: 380, zIndex: 500,
                background: 'var(--bg-secondary)',
                borderLeft: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column',
                boxShadow: '-24px 0 64px rgba(0,0,0,0.4)',
            }}
        >
            {/* Header */}
            <div style={{
                padding: '18px 20px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Bot size={18} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>OpsPulse AI</div>
                        <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                            Online
                        </div>
                    </div>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}
                    >
                        <div style={{
                            maxWidth: '85%',
                            padding: '10px 14px',
                            borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                            background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-card)',
                            fontSize: 13, lineHeight: 1.5,
                            color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                            border: m.role === 'bot' ? '1px solid var(--border)' : 'none',
                        }}>
                            {m.text}
                        </div>
                    </motion.div>
                ))}
                {loading && (
                    <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                                style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}
                            />
                        ))}
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '14px 16px', borderTop: '1px solid var(--border)',
                display: 'flex', gap: 8,
            }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder="Ask about your business..."
                    style={{ flex: 1, borderRadius: 10 }}
                />
                <button
                    onClick={send}
                    disabled={loading || !input.trim()}
                    className="btn btn-primary"
                    style={{ padding: '10px 14px', opacity: loading ? 0.6 : 1 }}
                >
                    <Send size={15} />
                </button>
            </div>
        </motion.div>
    );
}
