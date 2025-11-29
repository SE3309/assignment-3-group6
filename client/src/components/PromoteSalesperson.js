import React, { useCallback, useEffect, useState } from 'react';
import '../css/scheduleTestDrive.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const PromoteSalesperson = () => {
    const [form, setForm] = useState({
        SIN: '',
        bonus: '',
        newSalary: ''
    });

    const [suggestedSalary, setSuggestedSalary] = useState(null);

    const [search, setSearch] = useState({
        query: '',
        results: [],
        loading: false,
        page: 1,
        hasMore: false
    });

    const [message, setMessage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [roles, setRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);

    const loadRoles = useCallback(async () => {
        setLoadingRoles(true);
        try {
            const res = await fetch(`${API_BASE}/shiven/roles-overview`);
            const data = await res.json();
            setRoles(data);
        } catch (error) {
            setRoles([]);
        } finally {
            setLoadingRoles(false);
        }
    }, []);

    const loadSales = useCallback(
        async (page = 1) => {
            setSearch((prev) => ({ ...prev, loading: true }));
            try {
                const res = await fetch(
                    `${API_BASE}/shiven/search/salespeople?q=${encodeURIComponent(search.query || '')}&page=${page}`
                );
                const data = await res.json();
                setSearch((prev) => ({
                    ...prev,
                    loading: false,
                    results: data.results || [],
                    hasMore: !!data.hasMore,
                    page
                }));
            } catch (error) {
                setSearch((prev) => ({ ...prev, loading: false, results: [], hasMore: false }));
            }
        },
        [search.query]
    );

    useEffect(() => {
        const timer = setTimeout(() => loadSales(1), 250);
        return () => clearTimeout(timer);
    }, [search.query, loadSales]);

    useEffect(() => {
        loadRoles();
    }, [loadRoles]);

    const selectSIN = (salesperson) => {
        setForm((prev) => ({ ...prev, SIN: salesperson.SIN }));
        if (salesperson.salary) {
            const suggestion = salesperson.salary + salesperson.salary * (salesperson.commission || 0);
            setSuggestedSalary(suggestion);
        } else {
            setSuggestedSalary(null);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const promote = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const payload = {
                SIN: form.SIN,
                bonus: Number(form.bonus),
                newSalary: form.newSalary ? Number(form.newSalary) : undefined
            };

            if (!payload.SIN || Number.isNaN(payload.bonus)) {
                throw new Error('SIN and bonus are required.');
            }

            const res = await fetch(`${API_BASE}/shiven/promote-salesperson`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to promote salesperson.');
            }

            setMessage({
                type: 'success',
                text: `Promotion completed. Manager salary: ${data.managerSalary}. Salesperson record set to salary 0 / commission 0.`
            });
            loadRoles();
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    const renderRolesTable = () => (
        <div className="panel">
            <div className="panel-head">
                <div>
                    <p className="eyebrow">Validation</p>
                    <h2>Employee roles overview</h2>
                </div>
                {loadingRoles && <span className="pill pill-neutral">Refreshing…</span>}
            </div>
            {roles.length === 0 && !loadingRoles && <p className="muted">No employees found.</p>}
            {roles.length > 0 && (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>SIN</th>
                                <th>Name</th>
                                <th>Sales Salary</th>
                                <th>Manager Salary</th>
                                <th>Suggested Manager Salary</th>
                                <th>Bonus</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((row) => (
                                <tr key={row.SIN}>
                                    <td>{row.SIN}</td>
                                    <td>
                                        {row.fName} {row.lName}
                                    </td>
                                    <td>{row.salespersonSalary ?? '—'}</td>
                                    <td>{row.managerSalary ?? '—'}</td>
                                    <td>{row.suggestedManagerSalary ? Math.round(row.suggestedManagerSalary) : '—'}</td>
                                    <td>{row.bonus ?? '—'}</td>
                                    <td>{row.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <section className="layout">
            <form className="panel" onSubmit={promote}>
                <div className="panel-head">
                    <div>
                        <p className="eyebrow">Admin</p>
                        <h2>Promote Salesperson to Manager</h2>
                    </div>
                    {message && <div className={`callout ${message.type}`}>{message.text}</div>}
                </div>

                <div className="grid">
                    <label className="field search-field">
                        <span>Select Salesperson</span>
                        <div className="search-input">
                            <input
                                value={search.query}
                                onChange={(e) => setSearch((prev) => ({ ...prev, query: e.target.value, page: 1 }))}
                                placeholder="SIN or name"
                            />
                            {search.loading && <span className="loader">…</span>}
                        </div>
                        <div className="suggestions">
                            {search.results.map((s) => (
                                <button key={s.SIN} type="button" onClick={() => selectSIN(s)}>
                                    {s.SIN} — {s.fName} {s.lName} (salary: {s.salary}, comm: {s.commission})
                                </button>
                            ))}
                            {search.results.length === 0 && !search.loading && <div className="muted tiny">No results</div>}
                            <div className="pagination">
                                <button
                                    type="button"
                                    className="ghost"
                                    disabled={search.page <= 1 || search.loading}
                                    onClick={() => loadSales(search.page - 1)}
                                >
                                    Prev
                                </button>
                                <span className="muted tiny">Page {search.page}</span>
                                <button
                                    type="button"
                                    className="ghost"
                                    disabled={!search.hasMore || search.loading}
                                    onClick={() => loadSales(search.page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                            {form.SIN && <p className="muted tiny">Selected SIN: {form.SIN}</p>}
                        </div>
                    </label>

                    <label className="field">
                        <span>Bonus</span>
                        <input
                            type="number"
                            name="bonus"
                            value={form.bonus}
                            onChange={handleChange}
                            placeholder="e.g., 5000"
                            required
                        />
                    </label>

                    <label className="field">
                        <span>
                            New Salary (optional)
                            {suggestedSalary && (
                                <button
                                    type="button"
                                    className="ghost inline"
                                    onClick={() => setForm((prev) => ({ ...prev, newSalary: suggestedSalary }))}
                                >
                                    Use suggestion ({Math.round(suggestedSalary)})
                                </button>
                            )}
                        </span>
                        <input
                            type="number"
                            name="newSalary"
                            value={form.newSalary}
                            onChange={handleChange}
                            placeholder="Leave blank to keep current"
                        />
                    </label>
                </div>

                <button className="cta" type="submit" disabled={saving}>
                    {saving ? 'Promoting…' : 'Promote'}
                </button>
            </form>

            {renderRolesTable()}
        </section>
    );
};

export default PromoteSalesperson;
