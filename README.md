# Travlr Getaways Enhanced

## Overview

Travlr Getaways Enhanced is a full-stack travel management application developed as the Software Design and Engineering enhancement for the Southern New Hampshire University (SNHU) CS-499 Computer Science Capstone.

The project builds upon the original CS-465 Full Stack Development I artifact by improving the software architecture, security, maintainability, user experience, and overall code quality while preserving the application's original functionality.

The application consists of:

- A customer-facing website built with Express and Handlebars
- An Angular administrative single-page application (SPA)
- A RESTful API built with Express.js
- A MongoDB database for storing trip information and user accounts
- JWT-based authentication for protected administrative operations

---

# Original Artifact

The original artifact was developed during CS-465: Full Stack Development I.

The application provided the ability to:

- View available travel packages
- Authenticate as an administrator
- Add new trips
- Edit existing trips

While the original implementation successfully demonstrated full-stack development concepts, several opportunities existed to improve software quality, including:

- Error handling
- Input validation
- Security
- Configuration management
- User experience
- Responsive design
- Code organization
- Maintainability

These areas became the focus of the CS-499 Software Design and Engineering enhancement.

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
- Added centralized validation for trip creation and updates
- Improved validation error responses
- Standardized request validation across protected endpoints

### Error Handling

- Implemented centralized API error handling
- Added reusable `AppError` class
- Added asynchronous controller wrapper
- Added API-specific JSON 404 responses
- Improved consistency of error responses throughout the application

### Authentication & Security

- Improved JWT validation
- Improved Bearer token handling
- Added duplicate account detection
- Separated user registration from user login
- Added guest route protection
- Improved authentication workflow and error handling

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
- Dedicated Login page
- Dedicated Registration page

---

## Customer Website Improvements

- Removed duplicate static travel page
- Updated customer travel page to retrieve trip data dynamically through the REST API
- Updated navigation to use the dynamic `/travel` route
- Fixed broken navigation links
- Consolidated customer and administrative applications to consume the same backend data source

---

# Technology Stack

## Frontend

- Angular 17
- TypeScript
- Bootstrap
- HTML5
- CSS3

## Backend

- Node.js
- Express.js
- Passport.js
- JSON Web Tokens (JWT)

## Database

- MongoDB
- Mongoose

---

# Application Architecture

```
                 MongoDB
                    ▲
                    │
             Express REST API
                    ▲
         ┌──────────┴──────────┐
         │                     │
Customer Website         Angular Admin SPA
(Handlebars)             (Angular 17)
```

Both the customer-facing website and the Angular administrative application retrieve trip information through the same REST API.

Administrative operations require JWT authentication before protected endpoints are processed, improving security while reducing duplicate application logic.

---

# Authentication Flow

1. User registers for an account.
2. User logs in using an email address and password.
3. The server validates the supplied credentials.
4. A JWT is generated and returned.
5. The token is securely stored in browser storage.
6. Protected API requests include the Bearer token.
7. The server validates the token before allowing administrative operations.

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/trips` | Retrieve all trips |
| GET | `/api/trips/:tripCode` | Retrieve a specific trip |
| POST | `/api/login` | Authenticate a user |
| POST | `/api/register` | Register a new user |
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

A sample configuration file is included as `.env.example`.

---

# Installation

Install backend dependencies:

```bash
npm install
```

Install Angular dependencies:

```bash
cd app_admin
npm install
```

---

# Running the Application

Start the Express server:

```bash
npm start
```

Start the Angular administrative application:

```bash
cd app_admin
ng serve
```

Application URLs:

Customer Website

```
http://localhost:3000
```

Angular Administration

```
http://localhost:4200
```

---

# Testing

The enhanced application was validated through:

- Manual functional testing
- Authentication testing
- Registration testing
- CRUD testing
- Responsive layout testing
- Protected route testing
- API validation testing
- Centralized error handling verification
- Customer website integration testing

---

# Future Enhancements

Potential future enhancements include:

- Search, filtering, and pagination
- Administrative dashboards
- Trip categories
- User reviews and ratings
- Advanced MongoDB indexing
- Aggregation queries
- Role-based authorization

These features are outside the scope of the Software Design and Engineering enhancement and may be implemented in future iterations of the project.

---

# Author

**Kevin Crandall**

Bachelor of Science – Computer Science

Southern New Hampshire University

CS-499 Computer Science Capstone