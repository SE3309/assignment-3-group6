import React, { useEffect, useState } from 'react';
import '../css/scheduleTestDrive.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const SalesLeaderboard = () => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        minSales: 0
    });
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
            if (filters.minSales) params.append('minSales', filters.minSales);

            const res = await fetch(`${API_BASE}/shiven/sales-leaderboard?${params.toString()}`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to load leaderboard');
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
                        <h2>Salesperson Leaderboard</h2>
                    </div>
                    {error && <div className="callout error">{error}</div>}
                </div>

                <div className="grid">
                    <label className="field">
                        <span>Start Date</span>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} />
                    </label>
                    <label className="field">
                        <span>End Date</span>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleChange} />
                    </label>
                    <label className="field">
                        <span>Minimum Sales Count</span>
                        <input
                            type="number"
                            name="minSales"
                            min="0"
                            value={filters.minSales}
                            onChange={handleChange}
                        />
                    </label>
                </div>

                <button className="cta" type="submit" disabled={loading}>
                    {loading ? 'Loading…' : 'Run Leaderboard'}
                </button>
            </form>

            <div className="panel">
                <div className="panel-head">
                    <div>
                        <p className="eyebrow">Validation</p>
                        <h2>Ranked Performance</h2>
                    </div>
                    {loading && <span className="pill pill-neutral">Refreshing…</span>}
                </div>
                {rows.length === 0 && !loading && <p className="muted">No results for this range.</p>}
                {rows.length > 0 && (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Salesperson</th>
                                    <th>Vehicles Sold</th>
                                    <th>Total Revenue</th>
                                    <th>Avg Sale Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.SIN}>
                                        <td>{row.rankPosition}</td>
                                        <td>
                                            <div className="stacked">
                                                <strong>
                                                    {row.fName} {row.lName}
                                                </strong>
                                                <span className="muted">{row.SIN}</span>
                                            </div>
                                        </td>
                                        <td>{row.vehiclesSold}</td>
                                        <td>{row.totalRevenue != null ? `$${Number(row.totalRevenue).toLocaleString()}` : '—'}</td>
                                        <td>
                                            {row.avgSalePrice != null ? `$${Number(row.avgSalePrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'}
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

export default SalesLeaderboard;
