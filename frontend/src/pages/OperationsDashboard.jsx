import Navbar from '../components/layout/Navbar';
import InventoryChart from '../components/dashboard/InventoryChart';
import SupportTicketCard from '../components/dashboard/SupportTicketCard';
import AlertPanel from '../components/dashboard/AlertPanel';
import MetricCard from '../components/dashboard/MetricCard';
import { useMetrics } from '../hooks/useMetrics';
import { useAlerts } from '../hooks/useAlerts';
import { formatNumber } from '../lib/utils';

const section = (title, children) => (
    <section className="card" style={{ padding: '20px' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{title}</div>
        {children}
    </section>
);

export default function OperationsDashboard() {
    const { inventory, support } = useMetrics(5000);
    const { alerts, dismiss } = useAlerts(7000);

    return (
        <>
            <Navbar title="Operations Manager Dashboard" />
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <MetricCard title="Open Tickets" value={support ? formatNumber(support.openTickets) : '—'} icon="🎧" delta={support ? (support.openTickets > 20 ? 12 : -5) : 0} />
                    <MetricCard title="Resolved Today" value={support ? formatNumber(support.resolvedTickets) : '—'} icon="✅" delta={8.5} />
                    <MetricCard title="Avg Response" value={support ? `${support.avgResponse}h` : '—'} icon="⏱️" delta={-3.1} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {section('Inventory Status', <InventoryChart data={inventory} />)}
                    {section('Support Summary', <SupportTicketCard data={support} />)}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                    {section('Active Alerts', <AlertPanel alerts={alerts} onDismiss={dismiss} />)}
                </div>
            </div>
        </>
    );
}
