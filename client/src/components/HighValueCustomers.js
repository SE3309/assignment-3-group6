import React, { useEffect, useState } from 'react';
import '../css/scheduleTestDrive.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const formatDateISO = (date) => date.toISOString().slice(0, 10);

const HighValueCustomers = () => {
    const defaultStart = formatDateISO(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
    const defaultEnd = formatDateISO(new Date());

    const [filters, setFilters] = useState({ minSpend: 20000, tdStartDate: defaultStart, tdEndDate: defaultEnd, minTestDrives: 0 });
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters.minSpend) params.append('minSpend', filters.minSpend);
            if (filters.tdStartDate) params.append('tdStartDate', filters.tdStartDate);
            if (filters.tdEndDate) params.append('tdEndDate', filters.tdEndDate);
            if (filters.minTestDrives) params.append('minTestDrives', filters.minTestDrives);

            const res = await fetch(`${API_BASE}/shiven/high-value-customers?${params.toString()}`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to load report');
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    return (
        <section className="layout">
            <form className="panel" onSubmit={handleSubmit}>
                <div className="panel-head">
                    <div>
                        <p className="eyebrow">Filters</p>
                        <h2>High-Value & Engaged Customers</h2>
                    </div>
                    {error && <div className="callout error">{error}</div>}
                </div>
                <div className="grid">
                    <label className="field">
                        <span>Min Lifetime Spend</span>
                        <input
                            type="number"
                            name="minSpend"
                            min="0"
                            value={filters.minSpend}
                            onChange={handleChange}
                        />
                    </label>
                    <label className="field">
                        <span>Test Drive Start Date</span>
                        <input
                            type="date"
                            name="tdStartDate"
                            value={filters.tdStartDate}
                            onChange={handleChange}
                        />
                    </label>
                    <label className="field">
                        <span>Test Drive End Date</span>
                        <input
                            type="date"
                            name="tdEndDate"
                            value={filters.tdEndDate}
                            onChange={handleChange}
                        />
                    </label>
                    <label className="field">
                        <span>Min Test Drives in Window</span>
                        <input
                            type="number"
                            name="minTestDrives"
                            min="0"
                            value={filters.minTestDrives}
                            onChange={handleChange}
                        />
                    </label>
                </div>
                <button className="cta" type="submit" disabled={loading}>
                    {loading ? 'Loading…' : 'Run Report'}
                </button>
            </form>

            <div className="panel">
                <div className="panel-head">
                    <div>
                        <p className="eyebrow">Validation</p>
                        <h2>Priority Customers</h2>
                    </div>
                    {loading && <span className="pill pill-neutral">Refreshing…</span>}
                </div>
                {rows.length === 0 && !loading && <p className="muted">No customers match these criteria.</p>}
                {rows.length > 0 && (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Segment</th>
                                    <th>Customer</th>
                                    <th>Province</th>
                                    <th>Total Spend</th>
                                    <th>Total Sales</th>
                                    <th>Recent Test Drives</th>
                                    <th>Phone</th>
                                    <th>Last Test Drive</th>
                                    <th>Last Salesperson</th>
                                    <th>Last Vehicle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={`${row.driverLicenseNumber}-${idx}`}>
                                        <td>{row.segment}</td>
                                        <td>
                                            <div className="stacked">
                                                <strong>
                                                    {row.fName} {row.lName}
                                                </strong>
                                                <span className="muted">{row.driverLicenseNumber}</span>
                                            </div>
                                        </td>
                                    <td>{row.province}</td>
                                    <td>{row.totalSpent != null ? `$${Number(row.totalSpent).toLocaleString()}` : '—'}</td>
                                    <td>{row.totalSales ?? '—'}</td>
                                    <td>{row.recentTestDrives ?? 0}</td>
                                    <td>{row.phoneNumber ?? '—'}</td>
                                    <td>
                                        {row.lastTestDriveAt
                                            ? new Date(row.lastTestDriveAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                                            : '—'}
                                    </td>
                                    <td>
                                        {row.lastSalespersonFirstName
                                            ? `${row.lastSalespersonFirstName} ${row.lastSalespersonLastName}`
                                            : '—'}
                                    </td>
                                    <td>
                                        {row.lastVIN ? (
                                            <div className="stacked">
                                                <strong>{row.lastVIN}</strong>
                                                <span className="muted">
                                                    {row.lastVehicleMake} {row.lastVehicleModel} {row.lastVehicleTrim} — {row.lastVehicleStatus || 'Status N/A'}
                                                </span>
                                            </div>
                                        ) : (
                                            '—'
                                        )}
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

export default HighValueCustomers;
