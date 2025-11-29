import './App.css';
import ScheduleTestDrive from './components/ScheduleTestDrive';
import PromoteSalesperson from './components/PromoteSalesperson';
import SalesLeaderboard from './components/SalesLeaderboard';
import HighValueCustomers from './components/HighValueCustomers';
import ArchiveTestDrives from './components/ArchiveTestDrives';
import PaymentSchedule from './components/PaymentSchedule';
import UnconvertedTestDrives from './components/UnconvertedTestDrives';
import InventoryAnalytics from './components/InventoryAnalytics';

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
            <header className="app-header">
                <p className="eyebrow">Test Drives</p>
                <h1>Archive Test Drives</h1>
                <p className="lede">Manage and view archived test drive records.</p>
            </header>
            <ArchiveTestDrives />
            <header className="app-header">
                <p className="eyebrow">Finance</p>
                <h1>Payment Schedule</h1>
                <p className="lede">View and manage payment schedules.</p>
            </header>
            <PaymentSchedule />
            <header className="app-header">
                <p className="eyebrow">Sales • Warm Leads</p>
                <h1>Find Unconverted Test Drives (Warm Leads)</h1>
                <p className="lede">
                    Find customers who completed test drives but haven't made a purchase for any vehicle after test-drives, allowing for follow-up campaigns.
                </p>
            </header>
            <UnconvertedTestDrives />
            <header className="app-header">
                <p className="eyebrow">Inventory • Analytics</p>
                <h1>Inventory & Pricing Analytics by Make/Model</h1>
                <p className="lede">
                    Analyze available inventory with pricing and mileage statistics grouped by vehicle make and model.
                </p>
            </header>
            <InventoryAnalytics />
        </div>
    );
  }

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
