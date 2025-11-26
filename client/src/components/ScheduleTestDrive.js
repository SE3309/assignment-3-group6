import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../css/scheduleTestDrive.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const formatForMySQL = (date) => {
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const ScheduleTestDrive = () => {
    const [upcoming, setUpcoming] = useState([]);
    const [loadingUpcoming, setLoadingUpcoming] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    const [customerSearch, setCustomerSearch] = useState({
        query: '',
        results: [],
        loading: false,
        page: 1,
        hasMore: false,
        selectedLabel: ''
    });

    const [salesSearch, setSalesSearch] = useState({
        query: '',
        results: [],
        loading: false,
        page: 1,
        hasMore: false,
        selectedLabel: ''
    });

    const [vehicleSearch, setVehicleSearch] = useState({
        query: '',
        results: [],
        loading: false,
        page: 1,
        hasMore: false,
        selectedLabel: ''
    });

    const [statusEdits, setStatusEdits] = useState({});
    const [savingStatus, setSavingStatus] = useState({});

    const [form, setForm] = useState({
        driverLicenseNumber: '',
        VIN: '',
        SIN: '',
        date: '',
        startTime: '',
        durationMinutes: 45,
        status: 'Scheduled'
    });

    const vehicleLabel = useMemo(
        () => (vehicle) => `${vehicle.modelYear} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`,
        []
    );

    const loadCustomers = useCallback(
        async (pageOverride) => {
            const nextPage = pageOverride || 1;
            setCustomerSearch((prev) => ({ ...prev, loading: true }));
            try {
                const res = await fetch(
                    `${API_BASE}/shiven/search/customers?q=${encodeURIComponent(customerSearch.query || '')}&page=${nextPage}`
                );
                const data = await res.json();
                setCustomerSearch((prev) => ({
                    ...prev,
                    loading: false,
                    results: data.results || [],
                    hasMore: !!data.hasMore,
                    page: nextPage
                }));
            } catch (error) {
                setCustomerSearch((prev) => ({
                    ...prev,
                    loading: false,
                    results: [],
                    hasMore: false,
                    page: nextPage
                }));
            }
        },
        [customerSearch.query]
    );

    const loadSales = useCallback(
        async (pageOverride) => {
            const nextPage = pageOverride || 1;
            setSalesSearch((prev) => ({ ...prev, loading: true }));
            try {
                const res = await fetch(
                    `${API_BASE}/shiven/search/salespeople?q=${encodeURIComponent(salesSearch.query || '')}&page=${nextPage}`
                );
                const data = await res.json();
                setSalesSearch((prev) => ({
                    ...prev,
                    loading: false,
                    results: data.results || [],
                    hasMore: !!data.hasMore,
                    page: nextPage
                }));
            } catch (error) {
                setSalesSearch((prev) => ({
                    ...prev,
                    loading: false,
                    results: [],
                    hasMore: false,
                    page: nextPage
                }));
            }
        },
        [salesSearch.query]
    );

    const loadVehicles = useCallback(
        async (pageOverride) => {
            const nextPage = pageOverride || 1;
            setVehicleSearch((prev) => ({ ...prev, loading: true }));
            try {
                const res = await fetch(
                    `${API_BASE}/shiven/search/vehicles?q=${encodeURIComponent(vehicleSearch.query || '')}&page=${nextPage}`
                );
                const data = await res.json();
                setVehicleSearch((prev) => ({
                    ...prev,
                    loading: false,
                    results: data.results || [],
                    hasMore: !!data.hasMore,
                    page: nextPage
                }));
            } catch (error) {
                setVehicleSearch((prev) => ({
                    ...prev,
                    loading: false,
                    results: [],
                    hasMore: false,
                    page: nextPage
                }));
            }
        },
        [vehicleSearch.query]
    );

    useEffect(() => {
        const timer = setTimeout(() => loadCustomers(false), 250);
        return () => clearTimeout(timer);
    }, [customerSearch.query, loadCustomers]);

    useEffect(() => {
        const timer = setTimeout(() => loadSales(false), 250);
        return () => clearTimeout(timer);
    }, [salesSearch.query, loadSales]);

    useEffect(() => {
        const timer = setTimeout(() => loadVehicles(false), 250);
        return () => clearTimeout(timer);
    }, [vehicleSearch.query, loadVehicles]);

    const loadUpcoming = useCallback(async () => {
        if (form.VIN && form.date) {
            setLoadingUpcoming(true);
            try {
                const res = await fetch(
                    `${API_BASE}/shiven/test-drives/upcoming?vin=${encodeURIComponent(form.VIN)}&date=${encodeURIComponent(form.date)}`
                );
                const data = await res.json();
                setUpcoming(data);
                setStatusEdits({});
            } catch (error) {
                setUpcoming([]);
            } finally {
                setLoadingUpcoming(false);
            }
        } else {
            setUpcoming([]);
        }
    }, [form.VIN, form.date]);

    useEffect(() => {
        loadUpcoming();
    }, [loadUpcoming]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const selectCustomer = (customer) => {
        setForm((prev) => ({ ...prev, driverLicenseNumber: customer.driverLicenseNumber }));
        setCustomerSearch((prev) => ({
            ...prev,
            selectedLabel: `${customer.fName} ${customer.lName} (${customer.driverLicenseNumber})`,
            query: customer.driverLicenseNumber
        }));
    };

    const selectSales = (sales) => {
        setForm((prev) => ({ ...prev, SIN: sales.SIN }));
        setSalesSearch((prev) => ({
            ...prev,
            selectedLabel: `${sales.fName} ${sales.lName} (${sales.SIN})`,
            query: sales.SIN
        }));
    };

    const selectVehicle = (vehicle) => {
        setForm((prev) => ({ ...prev, VIN: vehicle.VIN }));
        setVehicleSearch((prev) => ({
            ...prev,
            selectedLabel: `${vehicleLabel(vehicle)} (${vehicle.VIN})`,
            query: vehicle.VIN
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            const startDateTime = new Date(`${form.date}T${form.startTime}`);
            const durationMinutes = Number(form.durationMinutes);

            if (Number.isNaN(startDateTime.getTime())) {
                throw new Error('Please provide a valid start date and time.');
            }

            if (!durationMinutes || durationMinutes <= 0) {
                throw new Error('Duration must be greater than zero.');
            }

            const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

            const payload = {
                driverLicenseNumber: form.driverLicenseNumber,
                VIN: form.VIN,
                SIN: form.SIN,
                status: form.status,
                startTime: formatForMySQL(startDateTime),
                endTime: formatForMySQL(endDateTime)
            };

            const response = await fetch(`${API_BASE}/shiven/test-drives`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || 'Failed to schedule test drive.');
            }

            setMessage({ type: 'success', text: `Test drive ${data.testDriveID} scheduled.` });
            setUpcoming(data.upcoming || []);
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSubmitting(false);
        }
    };

    const saveStatus = async (id, nextStatus) => {
        if (!nextStatus) return;
        setSavingStatus((prev) => ({ ...prev, [id]: true }));
        try {
            const response = await fetch(`${API_BASE}/shiven/test-drives/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || 'Failed to update status');
            }
            setMessage({ type: 'success', text: `Updated test drive ${id} to ${nextStatus}.` });
            loadUpcoming();
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSavingStatus((prev) => ({ ...prev, [id]: false }));
        }
    };

    const renderStatusBadge = (status) => {
        const variant = status.toLowerCase();
        return <span className={`pill pill-${variant}`}>{status}</span>;
    };

    const renderSearchField = ({
        label,
        query,
        onQuery,
        results,
        onSelect,
        loading,
        placeholder,
        helper,
        resultLabel,
        keyField,
        hasMore,
        onPageChange,
        page,
        canPrev
    }) => (
        <label className="field search-field">
            <span>{label}</span>
            <div className="search-input">
                <input
                    value={query}
                    onChange={(e) => onQuery(e.target.value)}
                    placeholder={placeholder}
                    autoComplete="off"
                />
                {loading && <span className="loader">…</span>}
            </div>
            {helper && <p className="muted tiny">Selected: {helper}</p>}
            {(results.length > 0 || loading || helper) && (
                <div className="suggestions">
                    {results.map((item) => (
                        <button key={item[keyField] || resultLabel(item)} type="button" onClick={() => onSelect(item)}>
                            {resultLabel(item)}
                        </button>
                    ))}
                    {results.length === 0 && !loading && <div className="muted tiny">No results</div>}
                    <div className="pagination">
                        <button type="button" className="ghost" disabled={!canPrev || loading} onClick={() => onPageChange(page - 1)}>
                            Prev
                        </button>
                        <span className="muted tiny">Page {page}</span>
                        <button type="button" className="ghost" disabled={!hasMore || loading} onClick={() => onPageChange(page + 1)}>
                            Next
                        </button>
                    </div>
                </div>
            )}
        </label>
    );

    const isSearching = customerSearch.loading || salesSearch.loading || vehicleSearch.loading;

    const renderScheduleCard = () => (
        <form className="panel" onSubmit={handleSubmit}>
            <div className="panel-head">
                <div>
                    <p className="eyebrow">Create booking</p>
                    <h2>New Test Drive</h2>
                </div>
                {message && <div className={`callout ${message.type}`}>{message.text}</div>}
            </div>

            <div className="grid">
                {renderSearchField({
                    label: 'Customer (search by license or name)',
                    query: customerSearch.query,
                    onQuery: (val) => {
                        setCustomerSearch((prev) => ({ ...prev, query: val, selectedLabel: '', page: 1 }));
                        setForm((prev) => ({ ...prev, driverLicenseNumber: val }));
                    },
                    results: customerSearch.results,
                    onSelect: selectCustomer,
                    loading: customerSearch.loading,
                    placeholder: 'e.g., DL12345 or Jane',
                    helper: customerSearch.selectedLabel,
                    resultLabel: (item) => `${item.driverLicenseNumber} — ${item.fName} ${item.lName}`,
                    keyField: 'driverLicenseNumber',
                    hasMore: customerSearch.hasMore,
                    onPageChange: (page) => loadCustomers(page),
                    page: customerSearch.page,
                    canPrev: customerSearch.page > 1
                })}

                {renderSearchField({
                    label: 'Salesperson (search by SIN or name)',
                    query: salesSearch.query,
                    onQuery: (val) => {
                        setSalesSearch((prev) => ({ ...prev, query: val, selectedLabel: '', page: 1 }));
                        setForm((prev) => ({ ...prev, SIN: val }));
                    },
                    results: salesSearch.results,
                    onSelect: selectSales,
                    loading: salesSearch.loading,
                    placeholder: 'e.g., 497369847 or Simone',
                    helper: salesSearch.selectedLabel,
                    resultLabel: (item) => `${item.SIN} — ${item.fName} ${item.lName}`,
                    keyField: 'SIN',
                    hasMore: salesSearch.hasMore,
                    onPageChange: (page) => loadSales(page),
                    page: salesSearch.page,
                    canPrev: salesSearch.page > 1
                })}

                {renderSearchField({
                    label: 'Vehicle (VIN, make, model, trim)',
                    query: vehicleSearch.query,
                    onQuery: (val) => {
                        setVehicleSearch((prev) => ({ ...prev, query: val, selectedLabel: '', page: 1 }));
                        setForm((prev) => ({ ...prev, VIN: val }));
                    },
                    results: vehicleSearch.results,
                    onSelect: selectVehicle,
                    loading: vehicleSearch.loading,
                    placeholder: 'e.g., VIN123 or Civic',
                    helper: vehicleSearch.selectedLabel,
                    resultLabel: (item) => `${item.VIN} — ${vehicleLabel(item)}`,
                    keyField: 'VIN',
                    hasMore: vehicleSearch.hasMore,
                    onPageChange: (page) => loadVehicles(page),
                    page: vehicleSearch.page,
                    canPrev: vehicleSearch.page > 1
                })}

                <label className="field">
                    <span>Date</span>
                    <input type="date" name="date" value={form.date} onChange={handleChange} required />
                </label>

                <label className="field">
                    <span>Start Time</span>
                    <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
                </label>

                <label className="field">
                    <span>Duration (minutes)</span>
                    <input
                        type="number"
                        name="durationMinutes"
                        min="1"
                        value={form.durationMinutes}
                        onChange={handleChange}
                        required
                    />
                </label>

                <label className="field">
                    <span>Status</span>
                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </label>
            </div>

            <button className="cta" type="submit" disabled={submitting || isSearching}>
                {submitting ? 'Scheduling…' : 'Schedule Test Drive'}
            </button>
        </form>
    );

    const renderUpcoming = () => (
        <div className="panel">
            <div className="panel-head">
                <div>
                    <p className="eyebrow">Validation</p>
                    <h2>Upcoming test drives for this vehicle</h2>
                </div>
                {loadingUpcoming && <span className="pill pill-neutral">Refreshing…</span>}
            </div>
            {(!form.VIN || !form.date) && <p className="muted">Pick a vehicle and date to see conflicts.</p>}
            {form.VIN && form.date && !upcoming.length && !loadingUpcoming && (
                <p className="muted">No test drives for this vehicle on the selected date.</p>
            )}
            {upcoming.length > 0 && (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Window</th>
                                <th>Customer</th>
                                <th>Salesperson</th>
                                <th>Status</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcoming.map((row) => {
                                const draftStatus = statusEdits[row.testDriveID] ?? row.testDriveStatus;
                                const hasChange = draftStatus !== row.testDriveStatus;

                                return (
                                    <tr key={row.testDriveID}>
                                        <td>{row.testDriveID}</td>
                                        <td>
                                            <div className="stacked">
                                                <strong>{new Date(row.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                                                <span className="muted">
                                                    {new Date(row.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            {row.customerFirstName} {row.customerLastName}
                                        </td>
                                        <td>
                                            {row.salespersonFirstName} {row.salespersonLastName}
                                        </td>
                                        <td>{renderStatusBadge(row.testDriveStatus)}</td>
                                        <td>
                                            <div className="status-editor">
                                                <select
                                                    value={draftStatus}
                                                    onChange={(e) =>
                                                        setStatusEdits((prev) => ({
                                                            ...prev,
                                                            [row.testDriveID]: e.target.value
                                                        }))
                                                    }
                                                >
                                                    <option value="Scheduled">Scheduled</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                                <button
                                                    type="button"
                                                    className="ghost"
                                                    disabled={savingStatus[row.testDriveID] || !hasChange}
                                                    onClick={() => saveStatus(row.testDriveID, draftStatus)}
                                                >
                                                    {savingStatus[row.testDriveID] ? 'Saving…' : 'Save'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <section className="layout">
            {renderScheduleCard()}
            {renderUpcoming()}
        </section>
    );
};

export default ScheduleTestDrive;
