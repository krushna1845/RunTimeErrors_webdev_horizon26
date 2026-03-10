import { createContext, useContext, useState } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
    const [chatOpen, setChatOpen] = useState(false);

    const toggleChat = () => setChatOpen(prev => !prev);
    const openChat = () => setChatOpen(true);
    const closeChat = () => setChatOpen(false);

    return (
        <UIContext.Provider value={{ chatOpen, toggleChat, openChat, closeChat }}>
            {children}
        </UIContext.Provider>
    );
}

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within a UIProvider');
    return context;
};
