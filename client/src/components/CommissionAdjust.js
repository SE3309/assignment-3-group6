import React, { useState } from 'react';

function CommissionAdjust() {
    //stores form inputs and API response/results
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [threshold, setThreshold] = useState('');
    const [bump, setBump] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    //handles the submit button: validates input, sends POST request
    const handleSubmit = async () => {
        if (!startDate || !endDate || !threshold || !bump) {
            setError('Please fill in all fields.');
            return;
        }

    //converts threshold and bump amount to numbers
    const thresholdNum = Number(threshold);
    const bumpNum = Number(bump);

    //validates numbers
    if (!Number.isFinite(thresholdNum) || !Number.isFinite(bumpNum)) {
        setError('Threshold and bump must be valid numbers.');
        return;
    }

    setError('');
    setResult(null);
    setLoading(true);

    try {
        //sends commission update to backend
        const res = await fetch('http://localhost:5001/api/arjun/commission-adjust', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                startDate,
                endDate,
                threshold: thresholdNum,
                bump: bumpNum,
            }),
        });

        const data = await res.json();

        //backend level error
        if (!data.ok) {
            setError(data.error || 'Request failed.');
        } else {
            setResult(data);
        }
    } catch (e) {
        console.error(e);
        setError('Network error while submitting.');
    } finally {
        setLoading(false);
    }
  };

  //extracts the list of affected salespeople from backend response
  const changes = result?.results || [];

  return (
    <div>
      <h2>Bulk Commission Adjustment</h2>
      <p className="subtitle">
        Boost commission for top performers based on total sales in a period.
      </p>

      {/* Inputs for adjustment criteria*/}
      <div className="form-row">
        <label>Start date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label>End date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label>Sales threshold ($)</label>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          placeholder="e.g. 50000"
          step="0.01"
        />
      </div>

      <div className="form-row">
        <label>Commission bump (percentage points)</label>
        <input
          type="number"
          value={bump}
          onChange={(e) => setBump(e.target.value)}
          placeholder="e.g. 1.5"
          step="0.1"
        />
      </div>

      {/* Error message if validation or API errors occur*/}
      {error && <p className="error-text">{error}</p>}

      <div className="button-row">
        <button
          className="btn primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Applying…' : 'Apply Adjustment'}
        </button>
      </div>

      {/*displays results after backend returns data*/}
      {result && (
        <div className="result-box info">
          <h4>{result.message || 'Commission adjustment completed.'}</h4>
          <p>
            <strong>Period:</strong> {result.startDate || startDate} to{' '}
            {result.endDate || endDate}
          </p>
          <p>
            <strong>Threshold:</strong> $
            {result.threshold != null
              ? Number(result.threshold).toFixed(2)
              : Number(threshold || 0).toFixed(2)}
          </p>
          <p>
            <strong>Bump:</strong>{' '}
            {result.bump != null ? result.bump : bump}
            %
          </p>

          {changes && changes.length > 0 ? (
            <>
              <h5>Affected Salespeople</h5>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Staff ID</th>
                      <th>Name</th>
                      <th>Total Sales ($)</th>
                      <th>Old Commission %</th>
                      <th>New Commission %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((row, idx) => (
                      <tr key={row.SIN}>
                        <td>{row.SIN}</td>
                        <td>{`${row.fName} ${row.lName}`}</td>
                        <td>{Number(row.totalRevenue).toFixed(2)}</td>
                        <td>{(Number(row.commissionBefore) * 100).toFixed(2)}</td>
                        <td>{(Number(row.commissionAfter) * 100).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p>No staff met the threshold for this period.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CommissionAdjust;