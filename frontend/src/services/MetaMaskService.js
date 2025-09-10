import { ethers } from 'ethers'

class MetaMaskService {
  constructor() {
    this.provider = null
    this.signer = null
    this.account = null
    this.isConnected = false
  }

  async checkMetaMaskAvailability() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed. Please install MetaMask to sign tax receipts.')
    }
    return true
  }

  async connectWallet() {
    try {
      await this.checkMetaMaskAvailability()
      
      console.log('Requesting MetaMask connection...')
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.')
      }
      
      // Initialize provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()
      this.account = accounts[0]
      this.isConnected = true
      
      console.log('Connected to MetaMask:', this.account)
      
      return {
        account: this.account,
        isConnected: this.isConnected
      }
      
    } catch (error) {
      console.error('MetaMask connection failed:', error)
      throw error
    }
  }

  async getNetwork() {
    if (!this.provider) {
      throw new Error('MetaMask not connected')
    }
    
    const network = await this.provider.getNetwork()
    return {
      chainId: Number(network.chainId),
      name: network.name
    }
  }

  async signTaxReceiptData(receiptData) {
    if (!this.signer || !this.isConnected) {
      throw new Error('MetaMask not connected. Please connect your wallet first.')
    }

    try {
      console.log('Signing tax receipt data...')
      
      // Create a structured message for signing
      const message = this.createSigningMessage(receiptData)
      
      // Sign the message
      const signature = await this.signer.signMessage(message)
      
      console.log('Tax receipt signed successfully')
      
      return {
        signature,
        message,
        signer: this.account,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('Signing failed:', error)
      throw error
    }
  }

  createSigningMessage(receiptData) {
    // Create a standardized message for tax receipt signing
    const message = `TAX RECEIPT VERIFICATION

This signature confirms the authenticity of the tax receipt for cryptocurrency staking rewards.

Wallet Address: ${receiptData.walletAddress}
Transaction Hash: ${receiptData.txHash}
Rewards Amount: ${receiptData.rewardsETH} ETH
USD Value: $${receiptData.creditedValueUSD}
Timestamp: ${receiptData.timestamp}

By signing this message, I confirm that the above information is accurate and this receipt represents legitimate staking rewards for tax purposes.

Generated: ${new Date().toISOString()}
Receipt ID: ${receiptData.executionId || 'pending'}`

    return message
  }

  async signTypedData(receiptData) {
    if (!this.signer || !this.isConnected) {
      throw new Error('MetaMask not connected')
    }

    try {
      // EIP-712 structured data for more secure signing
      const domain = {
        name: 'Tax Receipt System',
        version: '1',
        chainId: await this.signer.getChainId()
      }

      const types = {
        TaxReceipt: [
          { name: 'walletAddress', type: 'address' },
          { name: 'txHash', type: 'string' },
          { name: 'rewardsETH', type: 'string' },
          { name: 'creditedValueUSD', type: 'string' },
          { name: 'timestamp', type: 'string' },
          { name: 'executionId', type: 'string' }
        ]
      }

      const value = {
        walletAddress: receiptData.walletAddress,
        txHash: receiptData.txHash,
        rewardsETH: receiptData.rewardsETH.toString(),
        creditedValueUSD: receiptData.creditedValueUSD.toString(),
        timestamp: receiptData.timestamp,
        executionId: receiptData.executionId || 'pending'
      }

      const signature = await this.signer.signTypedData(domain, types, value)
      
      return {
        signature,
        domain,
        types,
        value,
        signer: this.account,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('Typed data signing failed:', error)
      throw error
    }
  }

  async verifySignature(signature, message, address) {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature)
      return recoveredAddress.toLowerCase() === address.toLowerCase()
    } catch (error) {
      console.error('Signature verification failed:', error)
      return false
    }
  }

  disconnect() {
    this.provider = null
    this.signer = null
    this.account = null
    this.isConnected = false
    console.log('MetaMask disconnected')
  }

  // Listen for account changes
  onAccountsChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect()
        } else {
          this.account = accounts[0]
        }
        callback(accounts)
      })
    }
  }

  // Listen for network changes
  onChainChanged(callback) {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId) => {
        callback(chainId)
      })
    }
  }
}

export default MetaMaskService
