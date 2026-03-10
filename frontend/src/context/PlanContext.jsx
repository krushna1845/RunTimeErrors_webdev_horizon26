import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PlanContext = createContext(null);

const PLAN_FEATURES = {
    free: ['dashboard', 'basic_score', 'simple_alerts'],
    premium: ['dashboard', 'basic_score', 'simple_alerts', 'warroom', 'chatbot', 'recommendations', 'predictions', 'ops_view', 'export'],
};

export function PlanProvider({ children }) {
    const { user } = useAuth();
    const [plan, setPlan] = useState('free');

    useEffect(() => {
        const stored = localStorage.getItem('ops_plan') || 'free';
        setPlan(stored);
    }, [user]);

    const upgradeToPremium = () => {
        localStorage.setItem('ops_plan', 'premium');
        setPlan('premium');
    };

    const hasFeature = (feature) => PLAN_FEATURES[plan]?.includes(feature) ?? false;

    return (
        <PlanContext.Provider value={{ plan, hasFeature, upgradeToPremium }}>
            {children}
        </PlanContext.Provider>
    );
}

export const usePlan = () => useContext(PlanContext);
