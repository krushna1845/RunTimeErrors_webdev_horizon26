const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// Mock database fallback for Demo Mode
let demoUsers = [
    { id: '1', email: 'owner@opspulse.com', password: 'password', role: 'owner', business_name: 'OpsPulse HQ' },
    { id: '2', email: 'manager@opspulse.com', password: 'password', role: 'manager', business_name: 'OpsPulse HQ' }
];

const isConfigured = () => {
    return process.env.SUPABASE_URL &&
        !process.env.SUPABASE_URL.includes('placeholder') &&
        process.env.SUPABASE_ANON_KEY &&
        !process.env.SUPABASE_ANON_KEY.includes('placeholder');
};

// Register
router.post('/register', async (req, res) => {
    const { email, password, role, business_name, full_name } = req.body;

    // Fallback to demo mode if not configured OR if we explicitly want to bypass
    if (!isConfigured()) {
        console.log('📝 Demo Mode: Registering user in-memory');
        if (demoUsers.find(u => u.email === email)) return res.status(400).json({ error: 'User already exists' });
        const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            password,
            role: role || 'owner',
            business_name: business_name || 'My Business'
        };
        demoUsers.push(newUser);
        return res.json({ user: newUser, message: 'Registration successful (Demo Mode)' });
    }

    try {
        // Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

        if (authError) {
            // Handle "fetch failed" which happens when DB is unreachable
            if (authError.message === 'fetch failed' || authError.status === 0) {
                console.warn('⚠️ Supabase unreachable. Falling back to Demo Mode for this request.');
                const newUser = { id: 'temp-' + Date.now(), email, password, role, business_name };
                demoUsers.push(newUser);
                return res.json({ user: newUser, message: 'Supabase Offline - Using Demo Mode' });
            }
            return res.status(400).json({ error: authError.message });
        }

        const { error: profileError } = await supabase.from('profiles').insert([{
            id: authData.user.id, email, full_name, business_name, role: role || 'owner'
        }]);

        if (profileError) {
            console.error('Profile Error:', profileError);
            return res.status(500).json({ error: 'Auth created, but profile failed. Please check your Supabase schema.' });
        }
        res.json({ user: authData.user, message: 'Registration successful' });
    } catch (err) {
        console.error('Registration Catch:', err);
        res.status(500).json({ error: 'Server error. Fallback to Demo Mode recommended.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    if (!isConfigured()) {
        console.log('🔑 Demo Mode: Login');
        const user = demoUsers.find(u => u.email === email && u.password === password);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        if (role && user.role !== role) return res.status(403).json({ error: `You are registered as ${user.role}.` });
        return res.json({ user, token: 'demo-token' });
    }

    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

        if (authError) {
            if (authError.message === 'fetch failed' || authError.status === 0) {
                const user = demoUsers.find(u => u.email === email && u.password === password);
                if (user) return res.json({ user, token: 'demo-token' });
                return res.status(502).json({ error: 'Database connection failed.' });
            }
            return res.status(401).json({ error: authError.message });
        }

        const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single();
        if (profileError || !profile) return res.status(404).json({ error: 'Profile not found.' });

        if (role && profile.role !== role) return res.status(403).json({ error: `Role mismatch.` });

        res.json({ user: { ...authData.user, ...profile }, token: authData.session.access_token });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
