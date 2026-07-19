# Travlr Getaways Enhanced

## Overview

Travlr Getaways Enhanced is a full-stack travel management application developed as the Software Design and Engineering enhancement for the Southern New Hampshire University (SNHU) CS-499 Computer Science Capstone.

The application builds upon the original CS-465 Full Stack Development I project by improving the software architecture, user experience, security, maintainability, and overall code quality while preserving the application's core functionality.

The application consists of:

- A customer-facing website built with Express and Handlebars
- An Angular administrative single-page application (SPA)
- A RESTful API built with Express.js
- A MongoDB database for storing trip information and user accounts
- JWT-based authentication for administrative functions

---

# Original Application

The original application allowed users to:

- View available travel packages
- Authenticate as an administrator
- Add new trips
- Edit existing trips

While functional, the original project contained opportunities to improve:

- Error handling
- Input validation
- Security
- Configuration management
- User experience
- Responsive design
- Application architecture

These areas became the focus of the software engineering enhancement.

---

# Software Engineering Enhancements

## Backend Improvements

### Environment Configuration

- Added `.env` support
- Externalized MongoDB connection string
- Externalized JWT secret
- Startup validation for required environment variables
- Added `.env.example`

### API Validation

- Implemented reusable request validation middleware
- Improved validation error responses
- Added consistent validation for trip creation and updates

### Error Handling

- Implemented centralized API error handling
- Added reusable `AppError` class
- Added asynchronous request wrapper
- Added API-specific 404 responses
- Improved error consistency throughout the application

### Authentication

- Improved JWT validation
- Improved Bearer token handling
- Added duplicate account detection
- Separated user registration from user login
- Added guest route protection

---

## Frontend Improvements

### User Interface

- Redesigned responsive trip listing
- Modernized trip cards
- Improved application layout
- Responsive navigation bar
- Mobile hamburger navigation
- Improved spacing and typography

### User Experience

- Loading indicators
- Success messages
- Error messages
- Improved empty-state messaging
- Responsive layouts for desktop, tablet, and mobile devices

### Forms

- Improved client-side validation
- Disabled submit buttons while processing
- Better validation feedback
- Dedicated login page
- Dedicated registration page

---

# Technology Stack

## Frontend

- Angular 17
- TypeScript
- Bootstrap
- HTML
- CSS

## Backend

- Node.js
- Express.js
- Passport.js
- JWT Authentication

## Database

- MongoDB
- Mongoose

---

# Application Architecture

```
Angular SPA
        │
        ▼
 REST API (Express)
        │
 Authentication
 Validation
 Error Handling
        │
        ▼
MongoDB Database
```

The customer-facing website communicates with the same REST API used by the Angular administrative application. Administrative requests require JWT authentication before protected endpoints are processed.

---

# Authentication Flow

1. User registers for an account.
2. User logs in using email and password.
3. Server validates credentials.
4. JWT token is returned.
5. Token is stored locally.
6. Protected API requests include the Bearer token.
7. Server validates the token before allowing administrative operations.

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/trips` | Retrieve all trips |
| GET | `/api/trips/:tripCode` | Retrieve a specific trip |
| POST | `/api/login` | Authenticate user |
| POST | `/api/register` | Register new user |
| POST | `/api/trips` | Create a trip (authenticated) |
| PUT | `/api/trips/:tripCode` | Update a trip (authenticated) |

---

# Environment Variables

Create a `.env` file in the project root.

Example:

```text
MONGODB_URI=mongodb://localhost/travlr
JWT_SECRET=your-secret-key
```

---

# Installation

Install project dependencies.

```bash
npm install
```

Install Angular dependencies.

```bash
cd app_admin
npm install
```

---

# Running the Application

Start the Express server.

```bash
npm start
```

Start the Angular administrative application.

```bash
cd app_admin
ng serve
```

Application URLs:

Customer Website

```
http://localhost:3000
```

Angular Administrator

```
http://localhost:4200
```

---

# Testing

The enhanced application was tested using:

- Manual functional testing
- Authentication testing
- CRUD testing
- Responsive layout testing
- Protected route testing
- API validation testing
- Error handling verification

---

# Future Enhancements

Planned future enhancements include:

- Search, filtering, and pagination
- Advanced MongoDB indexing
- Aggregation queries
- Trip categories
- User reviews
- Administrative dashboards

These enhancements will be implemented as part of future capstone milestones.

---

# Author

Kevin Crandall

Bachelor of Science – Computer Science

Southern New Hampshire University

CS-499 Computer Science Capstone