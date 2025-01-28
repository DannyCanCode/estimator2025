import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { EstimatesTab } from './components/EstimatesTab';
import Settings from '@/pages/Settings';
import './App.css';

export function App() {
  return (
    <Router>
      <div className="flex min-h-screen">
        <aside className="w-64 border-r bg-background">
          <Sidebar />
        </aside>
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/estimates" element={<EstimatesTab />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
