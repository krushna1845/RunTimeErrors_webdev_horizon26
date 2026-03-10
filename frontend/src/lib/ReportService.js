import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateCSV = (data) => {
    try {
        if (!data) throw new Error("No data available for export");

        const health = data.businessHealth || {};
        const financials = data.financials || {};
        const ops = data.operations || {};

        const headers = ['Metric', 'Value'];
        const rows = [
            ['Generated At', data.generatedAt || new Date().toISOString()],
            ['Stress Score', health.stressScore ?? 'N/A'],
            ['Business Status', health.status || 'N/A'],
            ['Revenue', financials.revenue ?? 0],
            ['Orders', financials.orders ?? 0],
            ['Refunds', financials.refunds ?? 0],
            ['Cash Balance', financials.cashBalance ?? 0],
            ['Inventory Level', ops.inventoryLevel ?? 0],
            ['Open Tickets', ops.openTickets ?? 0],
            ['Avg Response Time', ops.avgResponseTime ?? 0]
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `OpsPulse_Report_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('CSV Generation failed:', error);
        throw error;
    }
};

export const generatePDF = (data) => {
    try {
        if (!data) throw new Error("No data available for export");

        const health = data.businessHealth || {};
        const financials = data.financials || {};
        const ops = data.operations || {};

        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text('OpsPulse Business Report', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated at: ${new Date(data.generatedAt || Date.now()).toLocaleString()}`, 14, 30);

        const tableData = [
            ['Metric Category', 'Detail', 'Value'],
            ['Business Health', 'Stress Score', String(health.stressScore ?? 'N/A')],
            ['Business Health', 'Status', String(health.status || 'N/A')],
            ['Financials', 'Revenue', `$${Number(financials.revenue || 0).toLocaleString()}`],
            ['Financials', 'Orders', String(financials.orders || 0)],
            ['Financials', 'Refunds', String(financials.refunds || 0)],
            ['Financials', 'Cash Balance', `$${Number(financials.cashBalance || 0).toLocaleString()}`],
            ['Operations', 'Inventory Level', String(ops.inventoryLevel || 0)],
            ['Operations', 'Open Tickets', String(ops.openTickets || 0)],
            ['Operations', 'Avg Response Time', `${ops.avgResponseTime || 0}m`]
        ];

        autoTable(doc, {
            startY: 40,
            head: [tableData[0]],
            body: tableData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
            styles: { fontSize: 9 }
        });

        doc.save(`OpsPulse_Report_${new Date().getTime()}.pdf`);
    } catch (error) {
        console.error('PDF Generation failed:', error);
        throw error;
    }
};
