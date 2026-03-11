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
        if (!user) {
            setPlan('free');
            return;
        }
        const stored = localStorage.getItem(`ops_plan_${user.id}`) || 'free';
        setPlan(stored);
    }, [user]);

    const upgradeToPremium = () => {
        if (!user) return;
        localStorage.setItem(`ops_plan_${user.id}`, 'premium');
        setPlan('premium');
    };

    const downgradeToPlan = (targetPlan = 'free') => {
        if (!user) return;
        localStorage.setItem(`ops_plan_${user.id}`, targetPlan);
        setPlan(targetPlan);
    };

    const hasFeature = (feature) => PLAN_FEATURES[plan]?.includes(feature) ?? false;

    return (
        <PlanContext.Provider value={{ plan, hasFeature, upgradeToPremium, downgradeToPlan }}>
            {children}
        </PlanContext.Provider>
    );
}

export const usePlan = () => useContext(PlanContext);
