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
}

export default App;
