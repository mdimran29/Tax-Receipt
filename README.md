# 🏛️ Petition.io Tax Receipt Generator

> **Blockchain-Verified Legal Tax Receipts using OpenLaw Smart Contracts & MetaMask**

A full-stack application that generates **legally binding, cryptographically signed tax receipts** for cryptocurrency staking rewards using OpenLaw smart contract technology and MetaMask wallet integration.

## 🌟 **Key Features**

### 🔐 **Cryptographic Legal Validation**
- **MetaMask Integration**: Connect wallet and sign receipts with EIP-191 standard
- **Smart Contract Execution**: OpenLaw-powered legal document generation
- **Blockchain Verification**: Immutable proof of receipt authenticity
- **Legal Compliance**: Petition.io branded, legally binding tax documents

### 📄 **Professional Receipt Generation**
- **QR Code Integration**: Automatic Etherscan transaction QR codes
- **Comprehensive Data**: Principal staking, rewards, USD valuations, allocations
- **PDF Export**: High-quality, downloadable tax receipts
- **Real-time Calculations**: Automatic USD value computation

### 🚀 **Technical Architecture**
- **Backend**: Node.js + Express with OpenLaw API integration
- **Frontend**: React + Vite with Web3/MetaMask support
- **Blockchain**: Ethereum wallet signing with Ethers.js
- **Security**: Signature verification and cryptographic validation

## 🏗️ **Project Structure**

```
tax-receipt-generator/
├── backend/                      # Node.js Express Server
│   ├── src/
│   │   ├── services/
│   │   │   └── OpenLawService.js # OpenLaw API & signature verification
│   │   ├── templates/
│   │   │   └── TaxReceiptTemplate.openlaw # Petition.io legal template
│   │   └── server.js            # API endpoints & request handling
│   ├── receipts/                # Generated PDF storage
│   ├── package.json
│   └── .env                     # OpenLaw credentials
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── TaxReceiptGenerator.jsx # Main UI component
│   │   ├── services/
│   │   │   └── MetaMaskService.js      # Wallet integration
│   │   ├── App.jsx
│   │   └── App.css             # Professional styling
│   └── package.json
└── README.md
```

## � **API Endpoints**

### **Receipt Generation**
- `POST /api/receipt` - Generate demo receipt (no signature required)
- `POST /api/receipt/signed` - Generate legally signed receipt with MetaMask
- `POST /api/receipt/message` - Create signature message for wallet signing
- `GET /api/health` - Server health check

### **Request Format**
```json
{
  "walletAddress": "0x742d35Cc6641C8532B51d17A1B4d685D2262b8B2",
  "txHash": "0x1234...abcdef",
  "timestamp": "2025-09-10T07:32:56.681Z",
  "principalETH": 10.5,
  "rewardsETH": 0.75,
  "highestPriceUSD": 3500,
  "allocations": ["Validator Pool A: 60%", "Reserve Fund: 40%"],
  "disclaimers": "Tax reporting purposes only...",
  "signature": "0x665781b645b61ccb1d71bf682da98b24fc95a884edcdb1a160cca913cfb9364a...",
  "message": "TAX RECEIPT VERIFICATION..."
}
```

## 🛠️ **Quick Start**

### **Prerequisites**
- Node.js (v18+)
- MetaMask browser extension
- OpenLaw account (optional - demo mode available)

### **Backend Setup**

1. **Clone and setup backend:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment (.env):**
   ```env
   OPENLAW_BASE_URL=https://app.openlaw.io
   OPENLAW_EMAIL=your-email@example.com
   OPENLAW_PASSWORD=your-password
   TEMPLATE_NAME=TaxReceiptTemplate
   PORT=4000
   ```

3. **Start backend server:**
   ```bash
   npm run dev
   # Server runs on http://localhost:4000
   ```

### **Frontend Setup**

1. **Setup frontend:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

## 🎯 **Usage Guide**

### **Method 1: MetaMask Signed Receipt (Recommended)**
1. **Connect MetaMask**: Click "🦊 Connect MetaMask" button
2. **Fill Form**: Enter staking transaction details
3. **Sign Receipt**: Click "📝 Sign Receipt" to generate cryptographic signature
4. **Generate PDF**: Click "📄 Generate Signed Receipt" for legal document

### **Method 2: Demo Receipt**
1. **Fill Form**: Enter transaction data
2. **Generate**: Click "📄 Generate Receipt" for unsigned demo

## 🔐 **Security Features**

- **EIP-191 Message Signing**: Standard Ethereum message signing protocol
- **Signature Verification**: Server-side validation using Ethers.js
- **Cryptographic Proof**: Immutable proof of receipt authenticity
- **Legal Compliance**: Smart contract-backed legal documents

## 📋 **Receipt Template**

Generated receipts include:
- **Petition.io Branding**: Professional legal document format
- **Transaction QR Code**: Direct Etherscan link with QR code
- **Comprehensive Data**: All staking details, rewards, valuations
- **Legal Attestation**: Cryptographic signature validation
- **Allocation Breakdown**: Detailed validator pool distributions

## 🌐 **API Documentation**

### **Health Check**
```bash
GET /api/health
```

### **Generate Demo Receipt**
```bash
POST /api/receipt
Content-Type: application/json

{
  "walletAddress": "0x...",
  "txHash": "0x...",
  "rewardsETH": 0.75,
  "highestPriceUSD": 3500
}
```

### **Generate Signed Receipt**
```bash
POST /api/receipt/signed
Content-Type: application/json

{
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "TAX RECEIPT VERIFICATION..."
}
```

## 💡 **Technology Stack**

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **OpenLaw API** - Smart contract execution
- **Ethers.js** - Ethereum interaction & signature verification
- **PDFKit** - PDF generation fallback
- **Axios** - HTTP client

### **Frontend**
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Web3/MetaMask** - Wallet integration
- **Ethers.js** - Signature generation
- **CSS3** - Professional styling

## 🔧 **Development**

### **Backend Development**
```bash
cd backend
npm run dev        # Development with nodemon
npm start         # Production server
npm test          # Run tests (if available)
```

### **Frontend Development**
```bash
cd frontend
npm run dev       # Vite dev server
npm run build     # Production build
npm run preview   # Preview production build
```

## 🚀 **Production Deployment**

### **Backend**
1. Set production environment variables
2. Install dependencies: `npm ci --production`
3. Start with PM2: `pm2 start src/server.js`

### **Frontend**
1. Build: `npm run build`
2. Deploy `dist/` to static hosting (Netlify/Vercel)
3. Configure API base URL for production

## 🔒 **Security Considerations**

- **Environment Variables**: Never commit `.env` files
- **Signature Verification**: All signatures validated server-side
- **Input Validation**: All form data sanitized and validated
- **CORS**: Configured for specific origins in production
- **Rate Limiting**: Implement API rate limits for production use

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Issues**: Create GitHub issues for bugs/features
- **Documentation**: Check OpenLaw docs for template syntax
- **MetaMask**: Ensure MetaMask extension is installed and unlocked

## 🎯 **Roadmap**

- [ ] Multi-chain support (Polygon, BSC)
- [ ] Enhanced template customization
- [ ] Automated tax calculations
- [ ] Integration with tax software APIs
- [ ] Mobile app development

---

**Built with ❤️ for the crypto community by Petition.io**

> *Making cryptocurrency tax reporting simple, legal, and verifiable through blockchain technology.*
```

## 🔧 OpenLaw Template

The tax receipt template (`TaxReceiptTemplate.openlaw`) includes:

- **Transaction Details**: Wallet address, transaction hash, timestamp
- **Financial Information**: Principal amount, rewards, USD values
- **Allocation Breakdown**: Distribution percentages across pools
- **Legal Information**: Issuer and recipient identities
- **Disclaimers**: Tax and legal notices

## 🎯 Key Features

### No Blockchain Integration Required
- Uses manually provided test data
- No smart contract calls needed
- Perfect for testing and development

### Comprehensive Tax Receipt
- All required fields for tax reporting
- Automatic USD value calculation
- Professional PDF output via OpenLaw

### User-Friendly Interface
- Pre-filled test data for quick testing
- Form validation and error handling
- Real-time value calculations
- Receipt history and downloads

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify OpenLaw credentials in `.env`
   - Check if your OpenLaw account has API access

2. **Template Upload Fails**
   - Ensure you have template creation permissions
   - Try using the `/api/template/upload` endpoint first

3. **PDF Generation Fails**
   - Check OpenLaw template syntax
   - Verify all required template variables are provided

4. **Network Errors**
   - Ensure backend is running on port 4000
   - Check CORS settings if accessing from different domains

## 📁 File Structure Details

### Backend Files
- `src/server.js` - Express server with all API endpoints
- `src/services/OpenLawService.js` - OpenLaw API integration
- `src/templates/TaxReceiptTemplate.openlaw` - Receipt template
- `receipts/` - Generated PDF files storage

### Frontend Files
- `src/App.jsx` - Main app with tab navigation
- `src/components/TaxReceiptGenerator.jsx` - Form for receipt generation
- `src/components/ReceiptsList.jsx` - View and download receipts
- `src/App.css` - Comprehensive styling

## 📄 License

MIT License - feel free to use and modify as needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note**: This application is designed for development and testing purposes. For production use, ensure proper security measures, error handling, and compliance with relevant regulations.
