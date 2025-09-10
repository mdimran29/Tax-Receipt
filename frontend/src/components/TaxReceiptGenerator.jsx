import { useState } from 'react'
import axios from 'axios'
import MetaMaskService from '../services/MetaMaskService'
const API_BASE_URL = 'http://localhost:4000/api'

// Sample test data for quick testing
const SAMPLE_DATA = {
  walletAddress: '0x742d35Cc6641C8532B51d17A1B4d685D2262b8B2',
  txHash: '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef123456',
  timestamp: new Date().toISOString(),
  principalETH: 10.5,
  rewardsETH: 0.75,
  highestPriceUSD: 3500,
  allocations: [
    'Validator Pool A: 60%',
    'Validator Pool B: 30%', 
    'Reserve Fund: 10%'
  ],
  disclaimers: 'This receipt is generated for tax reporting purposes only. Please consult with a qualified tax professional regarding the proper treatment of cryptocurrency staking rewards in your jurisdiction. The values shown are based on market prices at the time of reward distribution.',
  issuerIdentity: 'Ethereum Staking Service Provider\nLicense: #12345\nAddress: 123 Blockchain St, Crypto City, CC 12345',
  donorIdentity: 'John Doe\nWallet: 0x742d35Cc6641C8532B51d17A1B4d685D2262b8B2\nEmail: john.doe@example.com'
}

function TaxReceiptGenerator() {
  const [formData, setFormData] = useState(SAMPLE_DATA)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  
  // MetaMask state
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false)
  const [connectedAccount, setConnectedAccount] = useState(null)
  const [signingMode, setSigningMode] = useState(false) // false = demo, true = legal
  const [signatureData, setSignatureData] = useState(null)
  const [metaMaskService] = useState(() => new MetaMaskService())

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'allocations') {
      // Handle allocations as array
      setFormData(prev => ({
        ...prev,
        [name]: value.split('\n').filter(line => line.trim())
      }))
    } else if (name === 'principalETH' || name === 'rewardsETH' || name === 'highestPriceUSD') {
      // Handle numeric fields
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }



  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // If signing mode is enabled, don't use normal submit
    if (signingMode) {
      setError('Please use the MetaMask signing workflow for legal receipts')
      return
    }
    
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('Sending data:', formData)
      
      // Generate regular demo receipt
      const response = await axios.post(`${API_BASE_URL}/receipt`, formData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      })

      console.log('Response:', response.data)
      setResult(response.data)
      
    } catch (err) {
      console.error('Error generating receipt:', err)
      
      if (err.response) {
        setError(`Server Error: ${err.response.data.message || err.response.statusText}`)
      } else if (err.request) {
        setError('Network Error: Unable to connect to the backend server. Make sure it\'s running on http://localhost:4000')
      } else {
        setError(`Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }



  const handleUseTestData = () => {
    setFormData(SAMPLE_DATA)
    setError(null)
    setResult(null)
    setSignatureData(null)
  }

  // MetaMask connection functions
  const handleConnectMetaMask = async () => {
    try {
      setError(null)
      console.log('Connecting to MetaMask...')
      
      const connection = await metaMaskService.connectWallet()
      setIsMetaMaskConnected(true)
      setConnectedAccount(connection.account)
      
      // Auto-populate wallet address if not set
      if (!formData.walletAddress || formData.walletAddress === SAMPLE_DATA.walletAddress) {
        setFormData(prev => ({
          ...prev,
          walletAddress: connection.account
        }))
      }
      
      console.log('MetaMask connected:', connection.account)
      
    } catch (error) {
      console.error('MetaMask connection failed:', error)
      setError(error.message)
    }
  }

  const handleDisconnectMetaMask = () => {
    metaMaskService.disconnect()
    setIsMetaMaskConnected(false)
    setConnectedAccount(null)
    setSignatureData(null)
    setSigningMode(false)
  }

  const handleSignReceipt = async () => {
    if (!isMetaMaskConnected) {
      setError('Please connect MetaMask first')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Prepare receipt data for signing
      const receiptData = {
        ...formData,
        walletAddress: connectedAccount,
        creditedValueUSD: calculatedCreditedValue
      }
      
      console.log('Signing receipt data with MetaMask...')
      
      // Sign the receipt data with MetaMask
      const signatureResult = await metaMaskService.signTaxReceiptData(receiptData)
      
      setSignatureData({
        signature: signatureResult.signature,
        message: signatureResult.message,
        address: signatureResult.signer,
        timestamp: signatureResult.timestamp
      })
      
      console.log('Receipt signed successfully')
      
    } catch (error) {
      console.error('Signing failed:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSignedReceipt = async () => {
    if (!signatureData) {
      setError('Please sign the receipt first')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const signedReceiptData = {
        ...formData,
        signature: signatureData.signature,
        message: signatureData.message,
        walletAddress: connectedAccount
      }
      
      console.log('Generating signed receipt with:', signedReceiptData)
      
      const response = await axios.post(`${API_BASE_URL}/receipt/signed`, signedReceiptData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      })
      
      console.log('Signed receipt response:', response.data)
      setResult(response.data)
      
    } catch (error) {
      console.error('Signed receipt generation failed:', error)
      
      if (error.response) {
        setError(`Server Error: ${error.response.data.message || error.response.statusText}`)
      } else if (error.request) {
        setError('Network Error: Unable to connect to the backend server')
      } else {
        setError(`Error: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const calculatedCreditedValue = formData.rewardsETH * formData.highestPriceUSD

  return (
    <div className="receipt-generator">
      <div className="generator-header">
        <h2>Generate Tax Receipt</h2>
        <div className="header-actions">
          <button 
            type="button" 
            onClick={handleUseTestData}
            className="test-data-btn"
          >
            Load Test Data
          </button>
        </div>
      </div>

      {/* MetaMask Integration Section */}
      <div className="metamask-section">
        <div className="metamask-header">
          <h3>🦊 MetaMask Integration</h3>
          <p>Connect MetaMask to create legally signed, blockchain-verified tax receipts</p>
        </div>
        
        <div className="metamask-controls">
          {!isMetaMaskConnected ? (
            <button 
              type="button"
              onClick={handleConnectMetaMask}
              disabled={loading}
              className="connect-wallet-btn"
            >
              {loading ? 'Connecting...' : '🦊 Connect MetaMask'}
            </button>
          ) : (
            <div className="wallet-connected">
              <div className="wallet-info">
                <span className="connection-status">✅ Connected</span>
                <span className="wallet-address">{connectedAccount?.slice(0, 6)}...{connectedAccount?.slice(-4)}</span>
                <button 
                  type="button"
                  onClick={handleDisconnectMetaMask}
                  className="disconnect-btn"
                >
                  Disconnect
                </button>
              </div>
              
              <div className="signing-options">
                <label className="signing-toggle">
                  <input
                    type="checkbox"
                    checked={signingMode}
                    onChange={(e) => setSigningMode(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Create Legally Signed Receipt (Smart Contract)
                </label>
                
                {signingMode && (
                  <p className="signing-info">
                    🔒 This will create a cryptographically signed, legally binding receipt that can be used for official tax purposes.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="receipt-form">
        <div className="form-section">
          <h3>Transaction Details</h3>
          
          <div className="form-group">
            <label htmlFor="walletAddress">Wallet Address *</label>
            <input
              type="text"
              id="walletAddress"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleInputChange}
              placeholder="0x..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="txHash">Transaction Hash *</label>
            <input
              type="text"
              id="txHash"
              name="txHash"
              value={formData.txHash}
              onChange={handleInputChange}
              placeholder="0x..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="timestamp">Timestamp</label>
            <input
              type="datetime-local"
              id="timestamp"
              name="timestamp"
              value={formData.timestamp ? formData.timestamp.slice(0, 16) : ''}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Staking Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="principalETH">Principal ETH</label>
              <input
                type="number"
                id="principalETH"
                name="principalETH"
                value={formData.principalETH}
                onChange={handleInputChange}
                step="0.000001"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="rewardsETH">Rewards ETH *</label>
              <input
                type="number"
                id="rewardsETH"
                name="rewardsETH"
                value={formData.rewardsETH}
                onChange={handleInputChange}
                step="0.000001"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="highestPriceUSD">Highest Price USD *</label>
              <input
                type="number"
                id="highestPriceUSD"
                name="highestPriceUSD"
                value={formData.highestPriceUSD}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Credited Value USD (Calculated)</label>
              <input
                type="text"
                value={`$${calculatedCreditedValue.toFixed(2)}`}
                disabled
                className="calculated-field"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Allocation Breakdown</h3>
          
          <div className="form-group">
            <label htmlFor="allocations">Allocations (one per line)</label>
            <textarea
              id="allocations"
              name="allocations"
              value={formData.allocations.join('\n')}
              onChange={handleInputChange}
              placeholder="Pool A: 50%&#10;Pool B: 30%&#10;Reserve: 20%"
              rows="4"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Identity Information</h3>
          
          <div className="form-group">
            <label htmlFor="issuerIdentity">Issuer Identity</label>
            <textarea
              id="issuerIdentity"
              name="issuerIdentity"
              value={formData.issuerIdentity}
              onChange={handleInputChange}
              placeholder="Company Name, License, Address"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="donorIdentity">Donor/Recipient Identity</label>
            <textarea
              id="donorIdentity"
              name="donorIdentity"
              value={formData.donorIdentity}
              onChange={handleInputChange}
              placeholder="Recipient Name, Wallet Address, Contact Info"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Legal Disclaimers</h3>
          
          <div className="form-group">
            <label htmlFor="disclaimers">Disclaimers</label>
            <textarea
              id="disclaimers"
              name="disclaimers"
              value={formData.disclaimers}
              onChange={handleInputChange}
              placeholder="Tax disclaimers and legal notices"
              rows="4"
            />
          </div>
        </div>

        <div className="form-actions">
          {!signingMode ? (
            // Demo mode - regular receipt generation
            <button 
              type="submit" 
              disabled={loading}
              className="generate-btn demo-mode"
            >
              {loading ? 'Generating Demo Receipt...' : '📄 Generate Demo Tax Receipt'}
            </button>
          ) : (
            // Signing mode - legal receipt workflow
            <div className="signing-workflow">
              {!signatureData ? (
                <button 
                  type="button"
                  onClick={handleSignReceipt}
                  disabled={loading || !isMetaMaskConnected}
                  className="generate-btn sign-step"
                >
                  {loading ? 'Preparing Signature...' : '✍️ Step 1: Sign with MetaMask'}
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={handleGenerateSignedReceipt}
                  disabled={loading}
                  className="generate-btn signed-mode"
                >
                  {loading ? 'Generating Legal Receipt...' : '� Step 2: Generate Legal Receipt'}
                </button>
              )}
              
              {signingMode && !isMetaMaskConnected && (
                <p className="connect-warning">
                  ⚠️ Please connect MetaMask to create signed receipts
                </p>
              )}
              
              {signatureData && (
                <div className="signature-confirmed">
                  <p className="signature-status">
                    ✅ Receipt signed successfully!
                    <br />
                    <small>Address: {signatureData.address}</small>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </form>

      {error && (
        <div className="alert alert-error">
          <h4>❌ Error</h4>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className={`alert alert-success ${result.isLegal ? 'signed-receipt' : ''}`}>
          <h4>
            {result.isLegal ? '🔒 Legal Tax Receipt Generated!' : '✅ Demo Receipt Generated Successfully!'}
          </h4>
          
          <div className="result-info">
            {result.receiptId && (
              <p><strong>Receipt ID:</strong> {result.receiptId}</p>
            )}
            <p><strong>Execution ID:</strong> {result.executionId}</p>
            <p><strong>Filename:</strong> {result.filename}</p>
            
            {result.isLegal && result.signatureVerified && (
              <>
                <p><strong>Legal Status:</strong> <span className="legal-status">✅ Legally Binding</span></p>
                <p><strong>Signature Verified:</strong> <span className="signature-verified">✅ MetaMask Verified</span></p>
                <p><strong>Smart Contract:</strong> <span className="contract-status">✅ Blockchain Backed</span></p>
                <p className="legal-notice">
                  🔒 This receipt is cryptographically signed using your MetaMask wallet and is legally binding for tax purposes. It's backed by smart contract technology for authenticity and non-repudiation.
                </p>
              </>
            )}
            
            {!result.isLegal && (
              <p className="demo-notice">
                📋 This is a demo receipt. To create a legally binding receipt, enable "Legal Mode" and connect MetaMask.
              </p>
            )}
            
            {result.downloadUrl && (
              <div className="download-section">
                <a 
                  href={`http://localhost:4000${result.downloadUrl}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`download-btn ${result.isLegal ? 'signed-download' : ''}`}
                >
                  {result.isLegal ? '🔒 Download Legal Receipt (PDF)' : '📄 Download Demo Receipt (PDF)'}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TaxReceiptGenerator
