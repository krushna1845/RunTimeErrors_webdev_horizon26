import { useState, useEffect, useCallback } from 'react';
import { getAlerts } from '../lib/api';

export function useAlerts(intervalMs = 7000) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            setAlerts(await getAlerts());
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch alerts:', err);
        }
    }, []);

    useEffect(() => {
        refresh();
        const id = setInterval(refresh, intervalMs);
        return () => clearInterval(id);
    }, [refresh, intervalMs]);

    const dismiss = (id) => setAlerts(prev => prev.filter(a => a.id !== id));

    return { alerts, loading, refresh, dismiss };
}
