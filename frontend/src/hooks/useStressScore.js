import { useState, useEffect, useCallback } from 'react';
import { getStressScore } from '../lib/api';

export function useStressScore(intervalMs = 5000, businessType = 'generic') {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            setData(await getStressScore(businessType));
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch stress score:', err);
        }
    }, [businessType]);

    useEffect(() => {
        refresh();
        const id = setInterval(refresh, intervalMs);
        return () => clearInterval(id);
    }, [refresh, intervalMs]);

    return { data, loading, refresh };
}
