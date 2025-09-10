import { useState } from 'react'
import TaxReceiptGenerator from './components/TaxReceiptGenerator'
import ReceiptsList from './components/ReceiptsList'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('generator')

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧾 Tax Receipt Generator</h1>
        <p>Generate OpenLaw tax receipts for cryptocurrency staking rewards</p>
      </header>

      <nav className="tab-nav">
        <button 
          className={activeTab === 'generator' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('generator')}
        >
          Generate Receipt
        </button>
        <button 
          className={activeTab === 'receipts' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('receipts')}
        >
          View Receipts
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'generator' && <TaxReceiptGenerator />}
        {activeTab === 'receipts' && <ReceiptsList />}
      </main>

      <footer className="app-footer">
        <p>Powered by OpenLaw • Built with React + Vite</p>
      </footer>
    </div>
  )
}

export default App
