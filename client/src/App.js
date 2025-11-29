import './App.css';
import ScheduleTestDrive from './components/ScheduleTestDrive';
import PromoteSalesperson from './components/PromoteSalesperson';

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
        </div>
    );
}

export default App;
