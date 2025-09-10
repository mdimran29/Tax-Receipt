# Tax Receipt Backend

Backend server for generating Tax Receipts using OpenLaw API.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   
   Update `.env` with your OpenLaw credentials:
   ```env
   OPENLAW_BASE_URL=https://app.openlaw.io
   OPENLAW_EMAIL=your-email@example.com
   OPENLAW_PASSWORD=your-password
   PORT=4000
   ```

3. **Run the server:**
   ```bash
   npm run dev
   ```

Server will start at `http://localhost:4000`

## API Endpoints

- `POST /api/receipt` - Generate tax receipt
- `GET /api/receipts` - List all receipts
- `GET /api/download/:filename` - Download PDF
- `GET /api/health` - Health check

## Dependencies

- **express** - Web framework
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **openlaw** - OpenLaw API client
- **axios** - HTTP client
- **fs-extra** - Enhanced file system operations
- **uuid** - Unique identifier generation
