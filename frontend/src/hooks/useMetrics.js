import { useState, useEffect, useCallback } from 'react';
import { getAllMetrics } from '../lib/api';

export function useMetrics(autoRefreshMs = 5000) {
    const [metrics, setMetrics] = useState({
        sales: null,
        inventory: null,
        support: null,
        cashflow: null,
        isExternal: false,
        source: 'Simulator'
    });
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const data = await getAllMetrics();
            setMetrics(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch metrics:', err);
        }
    }, []);

    useEffect(() => {
        refresh();
        const id = setInterval(refresh, autoRefreshMs);
        return () => clearInterval(id);
    }, [refresh, autoRefreshMs]);

    return {
        ...metrics,
        loading,
        refresh
    };
}
