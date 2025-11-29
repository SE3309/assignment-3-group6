import './App.css';
import ArchiveTestDrives from './components/ArchiveTestDrives';
import PaymentSchedule from './components/PaymentSchedule';

import InvoiceManager from './components/InvoiceManager';
import CommissionAdjust from './components/CommissionAdjust';

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>SE3309 Dealership Tools</h1>
      </header>

      <main className="app-main">
        <section className="card">
          <ArchiveTestDrives />
        </section>

        <section className="card">
          <PaymentSchedule />
        </section>

        <section className="card">
          <InvoiceManager />
        </section>

        <section className="card">
          <CommissionAdjust />
        </section>
      </main>
    </div>
  );
}

export default App;
