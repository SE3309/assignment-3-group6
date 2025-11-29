import './App.css';
import ScheduleTestDrive from './components/ScheduleTestDrive';
import PromoteSalesperson from './components/PromoteSalesperson';
import SalesLeaderboard from './components/SalesLeaderboard';
import HighValueCustomers from './components/HighValueCustomers';

function App() {
    return (
        <div className="App">
            <header className="app-header">
                <p className="eyebrow">Conflict-Free Booking</p>
                <h1>Schedule a Test Drive</h1>
                <p className="lede">
                    Pick a customer, vehicle, and salesperson, then lock in a time slot without double-booking a VIN.
                </p>
            </header>
            <ScheduleTestDrive />
            <header className="app-header">
                <p className="eyebrow">Admin • Promotion</p>
                <h1>Promote a Salesperson to Manager</h1>
                <p className="lede">Insert into Manager and optionally update salary, plus see role coverage.</p>
            </header>
            <PromoteSalesperson />
            <header className="app-header">
                <p className="eyebrow">Performance</p>
                <h1>Salesperson Performance Leaderboard</h1>
                <p className="lede">Rank revenue, volume, and average sale price for a date range.</p>
            </header>
            <SalesLeaderboard />
            <header className="app-header">
                <p className="eyebrow">Customers</p>
                <h1>High-Value Customers</h1>
                <p className="lede">Surface priority segments across lifetime spend and recent test drives.</p>
            </header>
            <HighValueCustomers />
        </div>
    );
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
