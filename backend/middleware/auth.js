// Basic auth middleware (Mock for hackathon)
// In a real app, verify Supabase JWT using @supabase/supabase-js or jsonwebtoken

const authMiddleware = (req, res, next) => {
    // For the demo, we bypass strict JWT verification
    // You can check for 'Bearer demo-token' or similar here
    next();
};

module.exports = authMiddleware;
