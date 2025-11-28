import React, { useState } from 'react';

function ArchiveTestDrives() {
  const [cutoff, setCutoff] = useState('');
  const [previewCount, setPreviewCount] = useState(null);
  const [deleteResult, setDeleteResult] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState('');

  const handlePreview = async () => {
    if (!cutoff) {
      setError('Please select a cutoff date.');
      return;
    }
    setError('');
    setDeleteResult(null);
    setLoadingPreview(true);

    try {
      const res = await fetch(
        `http://localhost:5001/api/caroline/archive-test-drives/preview?cutoff=${cutoff}`
      );
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || 'Preview failed.');
      } else {
        setPreviewCount(data.toDeleteCount);
      }
    } catch (e) {
      setError('Network error while previewing.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDelete = async () => {
    if (!cutoff) {
      setError('Please select a cutoff date.');
      return;
    }
    setError('');
    setLoadingDelete(true);

    try {
      const res = await fetch(
        'http://localhost:5001/api/caroline/archive-test-drives',
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cutoff })
        }
      );
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || 'Delete failed.');
      } else {
        setDeleteResult(data);
      }
    } catch (e) {
      setError('Network error while deleting.');
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div>
      <h2>Archive Old Unsuccessful Test Drives</h2>
      <p className="subtitle">
        Remove test drives older than a date where no matching sale exists for
        that customer &amp; VIN.
      </p>

      <div className="form-row">
        <label>Cutoff date</label>
        <input
          type="date"
          value={cutoff}
          onChange={(e) => setCutoff(e.target.value)}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="button-row">
        <button
          className="btn secondary"
          onClick={handlePreview}
          disabled={loadingPreview}
        >
          {loadingPreview ? 'Previewing…' : 'Preview Records'}
        </button>

        <button
          className="btn danger"
          onClick={handleDelete}
          disabled={loadingDelete}
        >
          {loadingDelete ? 'Archiving…' : 'Archive Now'}
        </button>
      </div>

      {previewCount !== null && !deleteResult && (
        <div className="result-box info">
          <h4>Preview</h4>
          <p>
            <strong>{previewCount}</strong>{' '}
            {previewCount === 1 ? 'record' : 'records'} will be archived if you
            proceed.
          </p>
        </div>
      )}

      {deleteResult && (
        <div className="result-box success">
          <h4>Archive Summary</h4>
          <p>{deleteResult.message}</p>
          <p>
            <strong>Cutoff:</strong> {deleteResult.cutoff}
          </p>
          <p>
            <strong>Deleted rows:</strong> {deleteResult.deletedCount}
          </p>

          {deleteResult.remainingOldTestDrives &&
            deleteResult.remainingOldTestDrives.length > 0 && (
              <>
                <h5>Remaining old test drives (sanity check)</h5>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>TestDriveID</th>
                        <th>Driver License</th>
                        <th>VIN</th>
                        <th>End Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deleteResult.remainingOldTestDrives.map((td) => (
                        <tr key={td.testDriveID}>
                          <td>{td.testDriveID}</td>
                          <td>{td.driverLicenseNumber}</td>
                          <td>{td.VIN}</td>
                          <td>{td.endTime}</td>
                          <td>{td.testDriveStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          {deleteResult.remainingOldTestDrives &&
            deleteResult.remainingOldTestDrives.length === 0 && (
              <p>No old test drives remain before the cutoff date.</p>
            )}
        </div>
      )}
    </div>
  );
}

export default ArchiveTestDrives;
