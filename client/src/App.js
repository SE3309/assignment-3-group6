// client/src/App.js
import './App.css';
import ArchiveTestDrives from './components/ArchiveTestDrives';
import PaymentSchedule from './components/PaymentSchedule';

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
      </main>
    </div>
  );
}

export default App;
