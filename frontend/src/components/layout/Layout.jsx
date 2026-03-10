import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import ChatbotDrawer from '../chatbot/ChatbotDrawer';
import { useUI } from '../../context/UIContext';

export default function Layout({ children }) {
    const { chatOpen, openChat, closeChat } = useUI();

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar onHelpClick={openChat} />
            <main style={{
                flex: 1,
                marginLeft: 'var(--sidebar-w)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                background: 'var(--bg-primary)',
            }}>
                {children}
            </main>

            <AnimatePresence>
                {chatOpen && <ChatbotDrawer onClose={closeChat} />}
            </AnimatePresence>
        </div>
    );
}
