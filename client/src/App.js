import './App.css';
import ScheduleTestDrive from './components/ScheduleTestDrive';

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
        </div>
    );
}

export default App;
