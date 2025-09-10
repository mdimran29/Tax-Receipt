# 🚀 VS Code Setup Guide - Tax Receipt OpenLaw Generator

## Quick Setup Instructions

### 1. **Open VS Code Terminal** (Ctrl+` or Terminal → New Terminal)

### 2. **Start the Backend Server:**
```bash
cd "/home/imran/Desktop/testing tax /backend"
npm run dev
```
✅ Backend will run at `http://localhost:4000`

### 3. **Open a New Terminal Tab** (Click the + icon or Ctrl+Shift+`)

### 4. **Start the Frontend Server:**
```bash
cd "/home/imran/Desktop/testing tax /frontend"  
npm run dev
```
✅ Frontend will run at `http://localhost:5173`

### 5. **Configure OpenLaw Credentials:**

Edit `backend/.env` with your OpenLaw account details:
```env
OPENLAW_BASE_URL=https://app.openlaw.io
OPENLAW_EMAIL=your-openlaw-email@example.com
OPENLAW_PASSWORD=your-openlaw-password
PORT=4000
TEMPLATE_NAME=TaxReceiptTemplate
```

### 6. **Test the Application:**

1. Open `http://localhost:5173` in your browser
2. Click "Load Test Data" to populate the form
3. Click "Generate Tax Receipt" to create a PDF
4. Download the generated receipt

## 📁 Project Structure

```
tax-receipt-openlaw/
├── backend/           # Express server (runs on :4000)
│   ├── src/
│   │   ├── services/OpenLawService.js
│   │   ├── templates/TaxReceiptTemplate.openlaw
│   │   └── server.js
│   ├── receipts/      # Generated PDFs saved here
│   └── .env           # ⚠️ Add your OpenLaw credentials here
├── frontend/          # React app (runs on :5173)
│   ├── src/
│   │   ├── components/
│   │   └── App.jsx
└── README.md
```

## 🔧 VS Code Tips

- **Split Terminal:** Click the split icon to run both servers side-by-side
- **Auto-save:** File → Auto Save (helpful for development)
- **Extensions:** Consider installing "Thunder Client" for API testing
- **File Explorer:** Use Ctrl+Shift+E to navigate between backend/frontend

## ⚡ Development Workflow

1. **Make changes** to frontend components in `frontend/src/`
2. **Save files** - Vite will auto-reload the browser
3. **Backend changes** in `backend/src/` require server restart (Ctrl+C, then `npm run dev`)
4. **Generated receipts** are saved in `backend/receipts/`

## 🐛 Common Issues

### Backend won't start:
- Check if port 4000 is already in use
- Verify OpenLaw credentials in `.env`

### Frontend can't connect:
- Ensure backend is running on localhost:4000
- Check browser console for CORS errors

### PDF generation fails:
- Verify OpenLaw account has template creation permissions
- Check the OpenLaw template syntax

## 📋 Test Data

The app includes sample data for quick testing:
- **Wallet:** `0x742d35Cc6641C8532B51d17A1B4d685D2262b8B2`
- **Rewards:** `0.75 ETH`
- **Price:** `$3500 USD`
- **Credited Value:** `$2625 USD` (calculated)

---

### Ready to Start? 🎉

1. Open VS Code terminal
2. Run the backend command above
3. Open new terminal tab
4. Run the frontend command above
5. Open `http://localhost:5173`
6. Click "Load Test Data" and "Generate Tax Receipt"

Your first tax receipt will be generated and saved! 📄✨
