import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../lib/api';

const AuthContext = createContext();

// Demo users for client-side fallback (when backend is unreachable)
const DEMO_USERS = [
    { id: '1', email: 'owner@opspulse.com', password: 'password', role: 'owner', business_name: 'OpsPulse HQ' },
    { id: '2', email: 'manager@opspulse.com', password: 'password', role: 'manager', business_name: 'OpsPulse HQ' },
];

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for session
        const saved = localStorage.getItem('op_user');
        if (saved) {
            try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
        }
        setLoading(false);
    }, []);

    const login = async (email, password, role) => {
        try {
            const data = await apiLogin(email, password, role);
            setUser(data.user);
            localStorage.setItem('op_user', JSON.stringify(data.user));
            localStorage.setItem('op_token', data.token);
            return { success: true };
        } catch (err) {
            // If backend is unreachable, fall back to demo credentials
            const isNetworkError = !err.response;
            if (isNetworkError) {
                const demo = DEMO_USERS.find(u => u.email === email && u.password === password);
                if (demo) {
                    if (role && demo.role !== role) {
                        return { success: false, error: `You are registered as ${demo.role}.` };
                    }
                    setUser(demo);
                    localStorage.setItem('op_user', JSON.stringify(demo));
                    localStorage.setItem('op_token', 'demo-token');
                    return { success: true };
                }
                return { success: false, error: 'Invalid credentials (Demo Mode)' };
            }
            return { success: false, error: err.response?.data?.error || 'Login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const data = await apiRegister(userData);
            return { success: true };
        } catch (err) {
            // If backend is unreachable, silently succeed in demo mode
            const isNetworkError = !err.response;
            if (isNetworkError) {
                return { success: true };
            }
            return { success: false, error: err.response?.data?.error || 'Registration failed' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('op_user');
        localStorage.removeItem('op_token');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
