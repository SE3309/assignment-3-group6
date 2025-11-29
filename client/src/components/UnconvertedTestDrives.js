import React, { useEffect, useState } from 'react';
import '../css/scheduleTestDrive.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const formatDateISO = (date) => date.toISOString().slice(0, 10);

const UnconvertedTestDrives = () => {
    const defaultStart = formatDateISO(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const defaultEnd = formatDateISO(new Date());

    const [filters, setFilters] = useState({ startDate: defaultStart, endDate: defaultEnd });
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const res = await fetch(`${API_BASE}/freda/unconverted-test-drives?${params.toString()}`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to load warm leads');
            }
            setRows(data);
        } catch (err) {
            setError(err.message);
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    const generateCSV = () => {
        if (rows.length === 0) {
            alert('No data to export');
            return;
        }

        // Prepare CSV content
        const headers = ['Customer Name', 'License Number', 'Email', 'VIN', 'Make', 'Model', 'Year', 'Test Drive Date', 'Test Drive Time'];
        const csvRows = [headers.join(',')];

        rows.forEach(row => {
            const emails = row.emails || 'No email on file';
            const testDriveDate = row.startTime ? new Date(row.startTime).toLocaleDateString() : '';
            const testDriveTime = row.startTime ? new Date(row.startTime).toLocaleTimeString() : '';
            
            csvRows.push([
                `"${row.fName} ${row.lName}"`,
                row.driverLicenseNumber,
                `"${emails}"`,
                row.VIN,
                row.make,
                row.model,
                row.modelYear,
                testDriveDate,
                testDriveTime
            ].join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `warm-leads-${filters.startDate}-to-${filters.endDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <section className="layout">
            <form className="panel" onSubmit={handleSubmit}>
                <div className="panel-head">
                    <div>
                        <p className="eyebrow">Filters</p>
                        <h2>Find Unconverted Test Drives (Warm Leads)</h2>
                    </div>
                    {error && <div className="callout error">{error}</div>}
                </div>
                <div className="grid">
                    <label className="field">
                        <span>Start Date</span>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label className="field">
                        <span>End Date</span>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <button className="cta" type="submit" disabled={loading}>
                    {loading ? 'Loading…' : 'Find Warm Leads'}
                </button>
            </form>

            <div className="panel">
                <div className="panel-head">
                    <div>
                        <p className="eyebrow">Validation</p>
                        <h2>Warm Leads Report</h2>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {loading && <span className="pill pill-neutral">Refreshing…</span>}
                        {rows.length > 0 && (
                            <button 
                                className="cta secondary" 
                                onClick={generateCSV}
                                style={{ marginLeft: 'auto' }}
                            >
                                Generate Follow-up Email List (CSV)
                            </button>
                        )}
                    </div>
                </div>
                {rows.length === 0 && !loading && <p className="muted">No unconverted test drives found for this date range.</p>}
                {rows.length > 0 && (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Email</th>
                                    <th>Vehicle</th>
                                    <th>Test Drive Date</th>
                                    <th>Test Drive Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={`${row.testDriveID}-${idx}`}>
                                        <td>
                                            <div className="stacked">
                                                <strong>
                                                    {row.fName} {row.lName}
                                                </strong>
                                                <span className="muted">{row.driverLicenseNumber}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {row.emails ? (
                                                <div className="stacked">
                                                    {row.emails.split(', ').map((email, i) => (
                                                        <span key={i}>{email}</span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="muted">No email on file</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="stacked">
                                                <strong>{row.make} {row.model} ({row.modelYear})</strong>
                                                <span className="muted">{row.VIN}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {row.startTime
                                                ? new Date(row.startTime).toLocaleDateString()
                                                : '—'}
                                        </td>
                                        <td>
                                            {row.startTime
                                                ? new Date(row.startTime).toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
};

export default UnconvertedTestDrives;

