import React, { useEffect, useState } from 'react';
import '../css/scheduleTestDrive.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const InventoryAnalytics = () => {
    const [filters, setFilters] = useState({ minCount: 0, groupByModel: false });
    const [summaryRows, setSummaryRows] = useState([]);
    const [detailRows, setDetailRows] = useState([]);
    const [selectedMake, setSelectedMake] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSummary = async () => {
        setLoading(true);
        setError(null);
        setSelectedMake(null);
        setSelectedModel(null);
        setDetailRows([]);
        try {
            const params = new URLSearchParams();
            if (filters.minCount) params.append('minCount', filters.minCount);
            if (filters.groupByModel) params.append('groupByModel', 'true');

            const res = await fetch(`${API_BASE}/freda/inventory-analytics?${params.toString()}`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to load inventory analytics');
            }
            setSummaryRows(data);
        } catch (err) {
            setError(err.message);
            setSummaryRows([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetails = async (make, model = null) => {
        setDetailLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('make', make);
            if (model) params.append('model', model);

            const res = await fetch(`${API_BASE}/freda/inventory-analytics/details?${params.toString()}`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to load vehicle details');
            }
            setDetailRows(data);
            setSelectedMake(make);
            setSelectedModel(model);
        } catch (err) {
            setError(err.message);
            setDetailRows([]);
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters((prev) => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchSummary();
    };

    const handleRowClick = (row) => {
        fetchDetails(row.make, row.model || null);
    };

    const handleBackClick = () => {
        setSelectedMake(null);
        setSelectedModel(null);
        setDetailRows([]);
    };

    return (
        <section className="layout">
            <form className="panel" onSubmit={handleSubmit}>
                <div className="panel-head">
                    <div>
                        <p className="eyebrow">Filters</p>
                        <h2>Inventory & Pricing Analytics by Make/Model</h2>
                    </div>
                    {error && <div className="callout error">{error}</div>}
                </div>
                <div className="grid">
                    <label className="field">
                        <span>Minimum Vehicle Count</span>
                        <input
                            type="number"
                            name="minCount"
                            min="0"
                            value={filters.minCount}
                            onChange={handleChange}
                        />
                        <small className="muted">Only show makes/models with at least this many available vehicles</small>
                    </label>
                    <label className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <input
                            type="checkbox"
                            name="groupByModel"
                            checked={filters.groupByModel}
                            onChange={handleChange}
                        />
                        <span>Group by Model (in addition to Make)</span>
                    </label>
                </div>
                <button className="cta" type="submit" disabled={loading}>
                    {loading ? 'Loading…' : 'Generate Analytics'}
                </button>
            </form>

            {!selectedMake ? (
                <div className="panel">
                    <div className="panel-head">
                        <div>
                            <p className="eyebrow">Validation</p>
                            <h2>Inventory Summary</h2>
                        </div>
                        {loading && <span className="pill pill-neutral">Refreshing…</span>}
                    </div>
                    {summaryRows.length === 0 && !loading && (
                        <p className="muted">No available vehicles match these criteria.</p>
                    )}
                    {summaryRows.length > 0 && (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Make</th>
                                        {filters.groupByModel && <th>Model</th>}
                                        <th>Count</th>
                                        <th>Min Price</th>
                                        <th>Avg Price</th>
                                        <th>Max Price</th>
                                        <th>Min Mileage</th>
                                        <th>Avg Mileage</th>
                                        <th>Max Mileage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summaryRows.map((row, idx) => (
                                        <tr 
                                            key={`${row.make}-${row.model || 'all'}-${idx}`}
                                            onClick={() => handleRowClick(row)}
                                            style={{ cursor: 'pointer' }}
                                            onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#f5f5f5'}
                                            onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = ''}
                                        >
                                            <td><strong>{row.make}</strong></td>
                                            {filters.groupByModel && <td>{row.model || '—'}</td>}
                                            <td>{row.vehicleCount}</td>
                                            <td>${Number(row.minPrice).toLocaleString()}</td>
                                            <td>${Number(row.avgPrice).toLocaleString()}</td>
                                            <td>${Number(row.maxPrice).toLocaleString()}</td>
                                            <td>{Number(row.minMileage).toLocaleString()}</td>
                                            <td>{Number(row.avgMileage).toLocaleString()}</td>
                                            <td>{Number(row.maxMileage).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="muted" style={{ marginTop: '1rem' }}>
                                💡 Click on a row to see the detailed vehicle list
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="panel">
                    <div className="panel-head">
                        <div>
                            <p className="eyebrow">Validation</p>
                            <h2>
                                Available Vehicles: {selectedMake}
                                {selectedModel && ` - ${selectedModel}`}
                            </h2>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {detailLoading && <span className="pill pill-neutral">Loading…</span>}
                            <button 
                                className="cta secondary" 
                                onClick={handleBackClick}
                            >
                                ← Back to Summary
                            </button>
                        </div>
                    </div>
                    {detailRows.length === 0 && !detailLoading && (
                        <p className="muted">No available vehicles found.</p>
                    )}
                    {detailRows.length > 0 && (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>VIN</th>
                                        <th>Stock #</th>
                                        <th>Year</th>
                                        <th>Make</th>
                                        <th>Model</th>
                                        <th>Trim</th>
                                        <th>Colour</th>
                                        <th>Mileage</th>
                                        <th>Base Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailRows.map((row, idx) => (
                                        <tr key={`${row.VIN}-${idx}`}>
                                            <td><strong>{row.VIN}</strong></td>
                                            <td>{row.stockNumber}</td>
                                            <td>{row.modelYear}</td>
                                            <td>{row.make}</td>
                                            <td>{row.model}</td>
                                            <td>{row.trim}</td>
                                            <td>{row.colour}</td>
                                            <td>{Number(row.mileage).toLocaleString()}</td>
                                            <td>${Number(row.basePrice).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default InventoryAnalytics;

