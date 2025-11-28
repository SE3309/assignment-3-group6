// client/src/components/PaymentSchedule.js
import React, { useState } from 'react';

function PaymentSchedule() {
  const [saleId, setSaleId] = useState('');
  const [termMonths, setTermMonths] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!saleId || !termMonths || !interestRate) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(
        'http://localhost:5001/api/caroline/payment-schedule',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            saleId: Number(saleId),
            termMonths: Number(termMonths),
            annualInterestRate: Number(interestRate)
          })
        }
      );
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || 'Request failed.');
      } else {
        setResult(data);
      }
    } catch (e) {
      setError('Network error while submitting.');
    } finally {
      setLoading(false);
    }
  };

  const schedule = result?.schedule;

  return (
    <div>
      <h2>Create / Recalculate Payment Schedule</h2>
      <p className="subtitle">
        Compute loan amount, monthly payment, and schedule end date for a sale.
      </p>

      <div className="form-row">
        <label>Sale ID</label>
        <input
          type="number"
          value={saleId}
          onChange={(e) => setSaleId(e.target.value)}
          placeholder="e.g. 29"
        />
      </div>

      <div className="form-row">
        <label>Term (months)</label>
        <input
          type="number"
          value={termMonths}
          onChange={(e) => setTermMonths(e.target.value)}
          placeholder="e.g. 36"
        />
      </div>

      <div className="form-row">
        <label>Interest rate (%)</label>
        <input
          type="number"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          placeholder="e.g. 5.5"
          step="0.1"
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="button-row">
        <button
          className="btn primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Calculating…' : 'Generate Schedule'}
        </button>
      </div>

      {result && (
        <div className="result-box info">
          <h4>{result.message}</h4>

          {schedule ? (
            <div className="schedule-grid">
              <div>
                <span className="label">Sale ID</span>
                <span className="value">{schedule.saleID}</span>
              </div>
              <div>
                <span className="label">Total Loan Amount</span>
                <span className="value">
                  ${Number(schedule.totalLoanAmount).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="label">Interest Rate</span>
                <span className="value">{schedule.interestRate}%</span>
              </div>
              <div>
                <span className="label">Term</span>
                <span className="value">
                  {schedule.termDurationMonths} months
                </span>
              </div>
              <div>
                <span className="label">Monthly Payment</span>
                <span className="value">
                  ${Number(schedule.monthlyPayment).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="label">Start Date</span>
                <span className="value">{schedule.startDate}</span>
              </div>
              <div>
                <span className="label">End Date</span>
                <span className="value">{schedule.endDate}</span>
              </div>
              <div>
                <span className="label">Status</span>
                <span className="value">{schedule.paymentStatus}</span>
              </div>
            </div>
          ) : (
            <p>No schedule returned.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default PaymentSchedule;
