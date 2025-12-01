import React, { useState } from 'react';

function InvoiceManager() {
    //holds all form inputs and API results
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [invoice, setInvoice] = useState(null);
    const [lineItems, setLineItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [itemName, setItemName] = useState('');

    //load an invoice and its line items from the backend by invoice number
    const handleLoad = async () => {
        if (!invoiceNumber) {
            setError('Please enter an invoice number.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await fetch(
            `http://localhost:5001/api/arjun/invoices/${invoiceNumber}`
            );
            const data = await res.json();

        //if backend returned ok: false, show error and clear any stale data
        if (!data.ok) {
        setError(data.error || 'Failed to load invoice.');
        setInvoice(null);
        setLineItems([]);
        } else {
        setInvoice(data.invoice);
        setLineItems(data.lineItems || []);
        }
        } catch (e) {
            console.error(e);
            setError('Network error while loading invoice.');
            setInvoice(null);
            setLineItems([]);
        } finally {
            setLoading(false);
        }
    };

    //add a new line item to the current invoice and recalculate the total
    const handleAddItem = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5001/api/arjun/invoices/${invoiceNumber}/line-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itemName,
                description,
                amount
            })
            });
            const data = await response.json();
            setLoading(false);

            if (!data.ok) {
            setError(data.error || 'Failed to add item');
            return;
            }

            setInvoice(data.invoice);
            setLineItems(data.lineItems);
            setItemName('');
            setDescription('');
            setAmount('');
        } catch (err) {
            setLoading(false);
            setError('Network error');
        }
    };

    //render the form inputs, buttons, and invoice/line item results
    return (
        <div>
            <h2>Invoice & Line Item Management</h2>
            <p className="subtitle">
                Load an invoice by number, then add a new line item and recalculate the total.
            </p>

            <div className="form-row">
            <label>Invoice Number</label>
            <input
                type="number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g. 1001"
            />
            </div>

            <div className="form-row">
            <label>Line Item Description</label>
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Winter tire package"
            />
            </div>

            <div className="form-row">
            <label>Item Name</label>
            <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Service Fee, Parts, Warranty"
            />
            </div>

            <div className="form-row">
            <label>Amount ($)</label>
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 499.99"
                step="0.01"
            />
            </div>

            {error && <p className="error-text">{error}</p>}

            {/* Buttons */}
            <div className="button-row">
            <button
                className="btn secondary"
                onClick={handleLoad}
                disabled={loading}
            >
                {loading ? 'Loading…' : 'Load Invoice'}
            </button>

            <button
                className="btn primary"
                onClick={handleAddItem}
                disabled={loading}
            >
                {loading ? 'Saving…' : 'Add Line Item & Recalculate Total'}
            </button>
            </div>

            {/* Invoice Header & Line Item Table */}
            {invoice && (
            <div className="result-box info">
                <h4>Invoice #{invoice.invoiceNumber}</h4>
                <p>
                <strong>Customer:</strong> {invoice.customerName || invoice.customer || 'N/A'}
                </p>
                <p>
                <strong>Date:</strong> {invoice.invoiceDate || invoice.date || 'N/A'}
                </p>
                <p>
                <strong>Total Amount:</strong>{' '}
                {invoice && invoice.totalAmountDue != null ? `$${Number(invoice.totalAmountDue).toFixed(2)}` : 'N/A'}
                </p>

                {lineItems && lineItems.length > 0 ? (
                <>
                    <h5>Line Items</h5>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Description</th>
                                <th>Amount ($)</th>
                            </tr>
                            </thead>
                            <tbody>
                            {lineItems.map((li, idx) => (
                                <tr key={li.lineItemID || li.lineItemNumber || idx}>
                                <td>{li.lineItemID || li.lineItemNumber || idx + 1}</td>
                                <td>{li.description || li.itemDescription}</td>
                                <td>
                                    {li.amount != null
                                    ? Number(li.amount).toFixed(2)
                                    : ''}
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
                ) : (
                <p>No line items found for this invoice yet.</p>
                )}
            </div>
            )}
        </div>
    );
}

export default InvoiceManager;
