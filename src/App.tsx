import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import PricingList from './pages/PricingList'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pricing-list" element={<PricingList />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App

