import { useState, useEffect, useCallback } from 'react';
import { getStressScore } from '../lib/api';

export function useStressScore(intervalMs = 5000) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            setData(await getStressScore());
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch stress score:', err);
        }
    }, []);

    useEffect(() => {
        refresh();
        const id = setInterval(refresh, intervalMs);
        return () => clearInterval(id);
    }, [refresh, intervalMs]);

    return { data, loading, refresh };
}
