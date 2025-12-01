import { useState } from 'react';
import './App.css';
import ScheduleTestDrive from './components/ScheduleTestDrive';
import PromoteSalesperson from './components/PromoteSalesperson';
import SalesLeaderboard from './components/SalesLeaderboard';
import HighValueCustomers from './components/HighValueCustomers';
import ArchiveTestDrives from './components/ArchiveTestDrives';
import PaymentSchedule from './components/PaymentSchedule';
import UnconvertedTestDrives from './components/UnconvertedTestDrives';
import InventoryAnalytics from './components/InventoryAnalytics';
import InvoiceManager from './components/InvoiceManager';
import CommissionAdjust from './components/CommissionAdjust';

function App() {
  const [activeTab, setActiveTab] = useState('schedule');

  const tabs = [
    {
      id: 'schedule',
      label: 'Schedule Test Drive',
      eyebrow: 'Conflict-Free Booking',
      title: 'Schedule a Test Drive',
      description: 'Pick a customer, vehicle, and salesperson, then lock in a time slot without double-booking a VIN.',
      component: <ScheduleTestDrive />
    },
    {
      id: 'promote',
      label: 'Promote Salesperson',
      eyebrow: 'Admin • Promotion',
      title: 'Promote a Salesperson to Manager',
      description: 'Insert into Manager and optionally update salary, plus see role coverage.',
      component: <PromoteSalesperson />
    },
    {
      id: 'leaderboard',
      label: 'Sales Leaderboard',
      eyebrow: 'Performance',
      title: 'Salesperson Performance Leaderboard',
      description: 'Rank revenue, volume, and average sale price for a date range.',
      component: <SalesLeaderboard />
    },
    {
      id: 'customers',
      label: 'High-Value Customers',
      eyebrow: 'Customers',
      title: 'High-Value Customers',
      description: 'Surface priority segments across lifetime spend and recent test drives.',
      component: <HighValueCustomers />
    },
    {
      id: 'archive',
      label: 'Archive Test Drives',
      eyebrow: 'Test Drives',
      title: 'Archive Test Drives',
      description: 'Manage and view archived test drive records.',
      component: <ArchiveTestDrives />
    },
    {
      id: 'payment',
      label: 'Payment Schedule',
      eyebrow: 'Finance',
      title: 'Payment Schedule',
      description: 'View and manage payment schedules.',
      component: <PaymentSchedule />
    },
    {
      id: 'unconverted',
      label: 'Unconverted Test Drives',
      eyebrow: 'Sales • Warm Leads',
      title: 'Find Unconverted Test Drives (Warm Leads)',
      description: 'Find customers who completed test drives but haven\'t made a purchase for any vehicle after test-drives, allowing for follow-up campaigns.',
      component: <UnconvertedTestDrives />
    },
    {
      id: 'inventory',
      label: 'Inventory Analytics',
      eyebrow: 'Inventory • Analytics',
      title: 'Inventory & Pricing Analytics by Make/Model',
      description: 'Analyze available inventory with pricing and mileage statistics grouped by vehicle make and model.',
      component: <InventoryAnalytics />
    },
    {
      id: 'invoice',
      label: 'Invoice Manager',
      eyebrow: 'Finance • Invoices',
      title: 'Invoice Manager',
      description: 'Create, view, and manage invoices.',
      component: <InvoiceManager />
    },
    {
      id: 'commission',
      label: 'Commission Adjust',
      eyebrow: 'Admin • Compensation',
      title: 'Commission Adjustments',
      description: 'Adjust commission rates and view salesperson commissions.',
      component: <CommissionAdjust />
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="App">
      <header className="main-header">
        <h1>🚗 SE3309 Dealership Management System</h1>
        <p>Complete dealership operations and analytics tools</p>
      </header>

      <div className="tabs-container">
        <div className="tabs-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tab-content">
        {activeTabData && (
          <>
            <header className="app-header">
              <p className="eyebrow">{activeTabData.eyebrow}</p>
              <h1>{activeTabData.title}</h1>
              <p className="lede">{activeTabData.description}</p>
            </header>
            <div className="feature-container">
              {activeTabData.component}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
