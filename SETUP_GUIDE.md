# Event Management App - Complete Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** (v18 or higher) installed
- **Git** installed
- A **PostgreSQL database** (we'll use Neon - free tier available)
- An **email service** (Gmail or Ethereal for testing)

---

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository (if not done)

```powershell
git clone https://github.com/MwambaEmmanuel/Assignment-3---Event-Management-App.git
cd "Assignment 3 - Event-Management-App"
```

### Step 2: Install Dependencies

```powershell
npm install
```

This installs all required packages including Express, Prisma, JWT, bcrypt, nodemailer, and WebSocket.

---

## 🗄️ Step 3: Set Up PostgreSQL Database (Neon)

### Option A: Use Neon (Recommended - Free & Easy)

1. **Go to [Neon.tech](https://neon.tech)** and sign up for a free account
2. **Create a new project**:
   - Project name: `event-management-app`
   - Region: Choose closest to you
   - PostgreSQL version: Latest (16+)
3. **Copy your connection string**:
   - Click on your project
   - Go to "Connection Details"
   - Copy the connection string (it looks like):
     ```
     postgresql://username:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
     ```

### Option B: Local PostgreSQL

If you have PostgreSQL installed locally:

```powershell
# Create a database
createdb event_management_db

# Your connection string will be:
# postgresql://postgres:password@localhost:5432/event_management_db
```

---

## ⚙️ Step 4: Configure Environment Variables

Open the `.env` file in the root directory and fill in your values:

```env
# 1. DATABASE_URL - Paste your Neon connection string here
DATABASE_URL="postgresql://username:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require"

# 2. JWT_SECRET - Generate a random string (or use any secure random string)
JWT_SECRET="my-super-secret-jwt-key-2024"

# 3. EMAIL Configuration - Choose one option below:

# Option A: Gmail (for production)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="youremail@gmail.com"
EMAIL_PASS="your-app-password"  # See instructions below

# Option B: Ethereal (for testing - easier setup)
# EMAIL_HOST="smtp.ethereal.email"
# EMAIL_PORT=587
# EMAIL_USER="get-from-ethereal.email"
# EMAIL_PASS="get-from-ethereal.email"

# 4. Server Port (optional)
PORT=5000
```

### 📧 Email Setup Instructions

#### Gmail Setup (Production):

1. Enable 2-Factor Authentication on your Google Account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Create a new app password for "Mail"
4. Copy the 16-character password
5. Use this password in `EMAIL_PASS` (not your regular Gmail password)

#### Ethereal Setup (Testing - Easier):

1. Go to [Ethereal Email](https://ethereal.email)
2. Click "Create Ethereal Account"
3. Copy the username and password shown
4. Paste them into `.env` as `EMAIL_USER` and `EMAIL_PASS`
5. Note: Emails won't actually send but you can view them on the Ethereal website

---

## 🔧 Step 5: Generate Prisma Client

```powershell
npx prisma generate
```

This creates the Prisma Client based on your schema.

---

## 📊 Step 6: Run Database Migrations

This creates all tables (User, Event, RSVP) in your database:

```powershell
npx prisma migrate dev --name init
```

You should see output like:
```
✔ Generated Prisma Client
✔ The following migration(s) have been created and applied:
migrations/
  └─ 20241028xxxxx_init/
    └─ migration.sql

Your database is now in sync with your schema.
```

### Verify Database Tables

```powershell
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can see your tables: `User`, `Event`, `RSVP`.

---

## ▶️ Step 7: Start the Development Server

```powershell
npm run dev
```

You should see:
```
Server listening on http://localhost:5000
Prisma connected
```

✅ **Your server is now running!**

---

## 🧪 Step 8: Test the API Endpoints

### Using PowerShell (curl alternative)

#### 1. Register a New User

```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "password123"
    role = "ORGANIZER"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "ORGANIZER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**📋 Copy the `token` value - you'll need it for authenticated requests!**

#### 2. Login

```powershell
$body = @{
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

#### 3. Create an Event (Authenticated)

```powershell
$token = "YOUR_TOKEN_HERE"  # Paste the token from register/login

$headers = @{
    "Authorization" = "Bearer $token"
}

$body = @{
    title = "Tech Meetup 2024"
    description = "Join us for an amazing tech discussion"
    date = "2024-12-15T18:00:00Z"
    location = "Online"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/events" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

#### 4. Get All Events

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/events" -Method GET
```

#### 5. RSVP to an Event

```powershell
$token = "YOUR_TOKEN_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
}

$body = @{
    eventId = 1
    status = "GOING"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/rsvp" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

---

## 🚀 Deploy to Render

### Step 1: Push to GitHub (Already Done ✅)

Your code is already on GitHub at:
`https://github.com/MwambaEmmanuel/Assignment-3---Event-Management-App`

### Step 2: Create Render Account

1. Go to [Render.com](https://render.com)
2. Sign up with your GitHub account

### Step 3: Create a Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `event-management-app`
   - **Environment:** `Node`
   - **Build Command:** `npm ci && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### Step 4: Add Environment Variables

In Render dashboard, go to "Environment" and add:

```
DATABASE_URL=your-neon-connection-string
JWT_SECRET=your-secure-random-string
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your-app-password
PORT=5000
```

### Step 5: Deploy

Click **"Create Web Service"** - Render will automatically deploy your app!

Your API will be available at: `https://event-management-app.onrender.com`

---

## 📝 Common Issues & Troubleshooting

### Issue: "Connection refused" error

**Solution:** Make sure your DATABASE_URL is correct and the database is accessible.

```powershell
# Test connection
npx prisma db push
```

### Issue: Email not sending

**Solution:**
- For Gmail: Ensure you're using an App Password, not your regular password
- For Ethereal: Check credentials at [ethereal.email](https://ethereal.email)
- Check console logs for error messages

### Issue: "Port already in use"

**Solution:** Change the PORT in `.env` or kill the process:

```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill it (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue: Prisma Client errors

**Solution:** Regenerate the client:

```powershell
npx prisma generate
```

### Issue: Migration errors

**Solution:** Reset the database (⚠️ deletes all data):

```powershell
npx prisma migrate reset
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |

### Event Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/events` | Get all events | No |
| POST | `/api/events` | Create event | Yes |
| PUT | `/api/events/:id` | Update event | Yes (Owner/Admin) |
| DELETE | `/api/events/:id` | Delete event | Yes (Owner/Admin) |

### RSVP Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/rsvp` | RSVP to event | Yes |

### WebSocket Events

- **Type:** `event` - When events are created/updated/deleted
- **Type:** `rsvp` - When users RSVP to events

---

## 🎯 Next Steps

1. ✅ Set up your database (Neon)
2. ✅ Configure `.env` with your credentials
3. ✅ Run migrations
4. ✅ Start the server
5. ✅ Test with Insomnia/Postman
6. ✅ Deploy to Render

**You're all set for production!** 🎉

---

**Happy Coding! 🚀**
