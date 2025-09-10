import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:4000/api'

function ReceiptsList() {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await axios.get(`${API_BASE_URL}/receipts`)
      
      if (response.data.success) {
        setReceipts(response.data.receipts)
      } else {
        setError('Failed to fetch receipts')
      }
    } catch (err) {
      console.error('Error fetching receipts:', err)
      
      if (err.response) {
        setError(`Server Error: ${err.response.data.message || err.response.statusText}`)
      } else if (err.request) {
        setError('Network Error: Unable to connect to the backend server')
      } else {
        setError(`Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="receipts-list">
        <h2>Generated Receipts</h2>
        <div className="loading">Loading receipts...</div>
      </div>
    )
  }

  return (
    <div className="receipts-list">
      <div className="list-header">
        <h2>Generated Receipts</h2>
        <button onClick={fetchReceipts} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <h4>❌ Error</h4>
          <p>{error}</p>
          <button onClick={fetchReceipts} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {!error && receipts.length === 0 && (
        <div className="empty-state">
          <p>📄 No receipts generated yet.</p>
          <p>Use the "Generate Receipt" tab to create your first tax receipt.</p>
        </div>
      )}

      {!error && receipts.length > 0 && (
        <div className="receipts-grid">
          {receipts.map((receipt, index) => (
            <div key={receipt.filename} className="receipt-card">
              <div className="receipt-icon">📄</div>
              
              <div className="receipt-info">
                <h3 className="receipt-filename">{receipt.filename}</h3>
                
                <div className="receipt-details">
                  <p><strong>Size:</strong> {formatFileSize(receipt.size)}</p>
                  <p><strong>Created:</strong> {formatDate(receipt.created)}</p>
                </div>
                
                <div className="receipt-actions">
                  <a 
                    href={`http://localhost:4000${receipt.downloadUrl}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="download-btn primary"
                  >
                    📥 Download PDF
                  </a>
                  
                  <a 
                    href={`http://localhost:4000${receipt.downloadUrl}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-btn secondary"
                  >
                    👁️ View
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="list-footer">
        <p>Total receipts: {receipts.length}</p>
      </div>
    </div>
  )
}

export default ReceiptsList
