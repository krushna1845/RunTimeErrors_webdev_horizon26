import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { scoreMeta } from '../../lib/utils';

export default function StressScoreGauge({ data }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!data || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2, cy = canvas.height * 0.72;
        const r = 90, lw = 16;
        const startAngle = Math.PI, endAngle = 2 * Math.PI;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Track
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = lw;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Score arc
        const pct = data.score / 100;
        const scoreEnd = startAngle + pct * Math.PI;
        const { color } = scoreMeta(data.level);
        const gradient = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, color);
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, scoreEnd);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = lw;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Tick marks
        for (let i = 0; i <= 10; i++) {
            const angle = startAngle + (i / 10) * Math.PI;
            const ir = r - 20, or = r - 12;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * ir, cy + Math.sin(angle) * ir);
            ctx.lineTo(cx + Math.cos(angle) * or, cy + Math.sin(angle) * or);
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }, [data]);

    if (!data) return <div className="skeleton" style={{ width: 220, height: 160, borderRadius: 12 }} />;
    const { color, label } = scoreMeta(data.level);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', width: 220, height: 130 }}>
                <canvas ref={canvasRef} width={220} height={130} />
                <div style={{
                    position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                    textAlign: 'center',
                }}>
                    <motion.div
                        key={data.score}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1 }}
                    >
                        {data.score}
                    </motion.div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>/ 100</div>
                </div>
            </div>

            <span className={`badge badge-${data.level === 'healthy' ? 'green' : data.level === 'caution' ? 'yellow' : data.level === 'warning' ? 'orange' : 'red'}`}>
                {label}
            </span>

            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
                {Object.entries(data.breakdown).map(([key, val]) => (
                    <div key={key} style={{
                        background: 'var(--bg-secondary)', borderRadius: 8,
                        padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono', color: val > 50 ? color : 'var(--text-secondary)' }}>{val.toFixed(0)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
