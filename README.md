# Event Management App (Monolith)

Simple, beginner-friendly monolithic backend for managing events with authentication, RSVP tracking, email notifications and live updates.

Quick start

1. Copy `.env.example` to `.env` and fill values (Postgres DATABASE_URL, JWT_SECRET, EMAIL_*).
2. Install dependencies:

```bash
npm install
```

3. Run Prisma migrations (ensure `DATABASE_URL` is set to a reachable Postgres instance):

```bash
npx prisma migrate dev --name init
```

4. Start in development:

```bash
npm run dev
```

APIs

- `POST /api/auth/register` - register
- `POST /api/auth/login` - login
- `GET /api/events` - list events
- `POST /api/events` - create event (authenticated)
- `PUT /api/events/:id` - update event (owner or admin)
- `DELETE /api/events/:id` - delete event (owner or admin)
- `POST /api/rsvp` - RSVP to event (authenticated)

WebSocket

Connect a client to the same server's WebSocket (ws://HOST) to receive `event` messages for updates and `rsvp` messages for RSVP notifications.

Notes

- Keep code simple and modular for learning.
- This repo is configured for deployment on Render or similar platforms.
# Event Management Application

A monolith event management application with user authentication, role-based access control, real-time updates, and database integration.

## 🚀 Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Role-Based Access Control**: Admin, Organizer, and Attendee roles
- **Event Management**: Full CRUD operations for events
- **RSVP System**: Users can RSVP to events (Going, Maybe, Not Going)
- **Real-Time Updates**: WebSocket integration for live event updates
- **Email Notifications**: Mock email sending via Ethereal API
- **API Documentation**: Auto-generated Swagger documentation
- **Database**: PostgreSQL with Prisma ORM

## 🛠️ Technology Stack

- **Backend Framework**: [Elysia.js](https://elysiajs.com/) - Fast and type-safe web framework
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Authentication**: JWT + bcrypt
- **Real-Time**: WebSockets
- **Email**: Nodemailer with Ethereal
- **Deployment**: Render
- **Runtime**: Bun

## 📁 Project Structure

```
event-management-app/
├── src/
│   ├── controllers/       # Business logic for routes
│   │   ├── authController.ts
│   │   ├── eventController.ts
│   │   └── rsvpController.ts
│   ├── middleware/        # Authentication and authorization
│   │   └── authMiddleware.ts
│   ├── routes/            # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── event.routes.ts
│   │   └── rsvp.routes.ts
│   ├── services/          # External integrations
│   │   ├── emailService.ts
│   │   └── wsService.ts
│   ├── utils/             # Helper functions
│   │   ├── jwtUtils.ts
│   │   └── errorHandler.ts
│   ├── prisma/            # Prisma client
│   │   └── client.ts
│   └── index.ts           # Main server entry
├── prisma/                # Database schema and migrations
│   └── schema.prisma
├── .env                   # Environment variables
├── package.json
├── tsconfig.json
├── render.yaml            # Render deployment config
└── README.md
```

## 🔧 Setup Instructions

### Prerequisites

- [Bun](https://bun.sh/) installed
- PostgreSQL database (Neon recommended)
- Node.js (for some tooling)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-management-app
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your database URL and JWT secret.

4. **Set up Ethereal Email (for testing)**
   - Visit [Ethereal Email](https://ethereal.email/)
   - Create a test account
   - Copy credentials to `.env`

5. **Set up the database**
   ```bash
   bun run db:generate
   bun run db:push
   ```

6. **Run the development server**
   ```bash
   bun run dev
   ```

The server will start at `http://localhost:3000`

## 📚 API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:3000/swagger`

## 🔐 User Roles

- **Admin**: Full access to all operations
- **Organizer**: Can create, update, and delete their own events
- **Attendee**: Can view events and RSVP

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event (Organizer/Admin)
- `PUT /api/events/:id` - Update event (Organizer/Admin)
- `DELETE /api/events/:id` - Delete event (Admin)

### RSVPs
- `GET /api/events/:id/rsvps` - Get RSVPs for an event
- `POST /api/events/:id/rsvp` - RSVP to an event
- `PUT /api/rsvps/:id` - Update RSVP status
- `DELETE /api/rsvps/:id` - Cancel RSVP

### WebSocket
- `ws://localhost:3000/ws` - Real-time event updates

## 🧪 Testing

Test the API using:
- [Insomnia](https://insomnia.rest/)
- [Postman](https://www.postman.com/)
- [Thunder Client](https://www.thunderclient.com/) (VS Code extension)

## 🚀 Deployment

### Render Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables in Render dashboard
4. Deploy!

The `render.yaml` file contains the deployment configuration.

## 🎯 Design Principles Applied

### SOLID Principles
- **Single Responsibility**: Each controller, service, and utility has one responsibility
- **Open/Closed**: Middleware system allows extension without modification
- **Dependency Inversion**: Services depend on abstractions (interfaces)

### Clean Architecture
- Clear separation of concerns (routes, controllers, services)
- Business logic isolated in controllers
- External integrations in services layer

### Security Best Practices
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Environment variable configuration

## 📝 Database Schema

### User
- id, email, password (hashed), name, role, createdAt

### Event
- id, title, description, date, location, organizerId, createdAt, updatedAt

### RSVP
- id, userId, eventId, status, createdAt, updatedAt

## 🤝 Contributing

Contributions are welcome! Please follow the existing code structure and patterns.

## 📄 License

ISC

## 👤 Author

[Your Name]

---

**Assignment 3 - Software Design**  
Event Management Application with Monolithic Architecture
