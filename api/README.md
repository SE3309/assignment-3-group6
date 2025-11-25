## Setup

1. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update your database credentials in `.env` (DB_USER, DB_PASSWORD, DB_NAME)

2. **Run the backend:**
   In the api folder:
   ```bash
   # on first run
   npm install

   npm run dev
   ```

3. **Run the frontend:**
   In the client folder:
   ```bash
   # on first run
   npm install

   npm start
   ```

## Project Structure

```
api/
├── config/          # Configuration files (database, etc.)
├── routes/          # Route definitions
├── controllers/     # Request handlers
├── models/          # Data models (optional)
├── middleware/      # Custom middleware
├── server.js        # Entry point
└── package.json
```

## API Endpoints

Base URL: `http://localhost:5000/api`

### Health Check
- `GET /api/health` - Check if API is running

### TODO: Add your routes here
- Vehicles
- Customers
- Salespersons
- Sales
- Test Drives
- etc.

