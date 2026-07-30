# Travlr Getaways Enhanced

## Overview

Travlr Getaways Enhanced is a full-stack travel management application developed as the primary artifact for the Southern New Hampshire University (SNHU) CS-499 Computer Science Capstone.

The project builds upon the original CS-465 Full Stack Development I artifact through a series of enhancements focused on Software Design and Engineering, Algorithms and Data Structures, and Database Design. These enhancements improve the application's architecture, maintainability, performance, security, scalability, and overall user experience while preserving its original functionality.

The application consists of:

- A customer-facing website built with Express and Handlebars
- An Angular administrative single-page application (SPA)
- A RESTful API built with Express.js
- A MongoDB database for storing trips, categories, reviews, and user accounts
- JWT-based authentication for protected administrative operations

---

# Original Artifact

The original artifact was developed during **CS-465: Full Stack Development I**.

The application originally provided the ability to:

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
- Query performance
- Database design

These opportunities became the foundation for the CS-499 enhancement milestones.

---

# Enhancement Timeline

## ✅ Software Design & Engineering

Focused on improving application quality, maintainability, security, and user experience.

## ✅ Algorithms & Data Structures

Focused on improving data retrieval efficiency through server-side searching, filtering, sorting, and pagination.

## ✅ Database

Focused on improving MongoDB data modeling, relationships, validation, aggregation pipelines, and customer interaction through reviews and ratings.

---

# Software Design & Engineering Enhancements

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
- Updated the customer travel page to retrieve trip data dynamically through the REST API
- Added dedicated customer trip detail pages
- Added customer review submission
- Displayed trip ratings and review summaries
- Updated navigation to use the dynamic `/travel` route
- Fixed broken navigation links
- Consolidated customer and administrative applications to consume the same backend data source

---

# Algorithms & Data Structures Enhancement

The second enhancement focused on improving the efficiency of retrieving and processing trip information. Rather than returning all trip data and performing operations on the client, the application now performs searching, filtering, sorting, and pagination on the server through the REST API and MongoDB.

## Backend Improvements

- Implemented server-side searching across trip name, resort, and description
- Added server-side filtering by minimum price, maximum price, and trip duration
- Implemented server-side sorting by:
  - Trip name
  - Resort
  - Duration
  - Price
- Added server-side pagination with metadata
- Added validation for search and filter parameters
- Implemented efficient querying using normalized numeric fields
- Improved API scalability by reducing unnecessary client-side processing

## User Experience Improvements

Both the Angular administrative application and the customer-facing website now support:

- Search
- Price filtering
- Duration filtering
- Server-side sorting
- Server-side pagination
- Improved empty-state messaging
- Preserved filter state across pagination
- Consistent querying behavior across both application interfaces

---

# Database Enhancement

The final enhancement focused on improving the application's MongoDB architecture by redesigning the database schema, introducing relationships between collections, improving query performance, and adding customer-generated content through reviews and ratings.

These enhancements demonstrate more advanced database design techniques while improving scalability, maintainability, and reporting capabilities.

## Database Design Improvements

- Introduced dedicated **Category** and **Review** collections
- Established one-to-many relationships using MongoDB ObjectId references
- Normalized trip duration into a numeric field for efficient querying
- Stored computed review metrics directly on trip documents to improve query performance
- Added database indexes to improve query performance
- Expanded schema validation throughout the application

## Customer Reviews

Customers can now:

- Submit reviews directly from the customer website
- Assign star ratings
- Leave written feedback
- View reviews in newest-first order

Review submissions automatically update:

- Average trip rating
- Review count
- Administrative dashboard statistics

## MongoDB Aggregation Pipelines

MongoDB aggregation pipelines were implemented to calculate:

- Overall trip statistics
- Price summaries
- Duration summaries
- Highest-rated destinations
- Most-reviewed destinations
- Category-based statistics

These aggregation pipelines power the Angular administrative dashboard while minimizing application-side processing and demonstrating advanced MongoDB querying techniques.

## Administrative Dashboard

The administrative application now displays:

- Total trips
- Average pricing
- Price ranges
- Average trip duration
- Duration ranges
- Total reviews
- Reviewed trips
- Average ratings
- Highest-rated destinations
- Most-reviewed destinations
- Category-based statistics

---

# Technology Stack

## Frontend

- Angular 17
- TypeScript
- Bootstrap
- HTML5
- CSS3
- Handlebars

## Backend

- Node.js
- Express.js
- Passport.js
- JSON Web Tokens (JWT)

## Database

- MongoDB
- Mongoose
- MongoDB Aggregation Framework

---

# Application Architecture

```
                    MongoDB
          ┌──────────┼──────────┐
          │          │          │
       Trips    Categories   Reviews
          ▲
          │
     Express REST API
          ▲
     ┌────┴────┐
     │         │
Customer   Angular Admin
Website        SPA
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
| GET | `/api/trips` | Retrieve trips with searching, filtering, sorting, and pagination |
| GET | `/api/trips/stats` | Retrieve administrative dashboard statistics |
| GET | `/api/categories` | Retrieve available trip categories |
| GET | `/api/trips/:tripCode` | Retrieve a specific trip |
| GET | `/api/trips/:tripCode/reviews` | Retrieve reviews for a trip |
| POST | `/api/trips/:tripCode/reviews` | Submit a customer review |
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

## Customer Website

```
http://localhost:3000
```

## Angular Administration

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
- Customer review submission testing
- Customer trip detail page testing
- Search testing
- Filtering testing
- Sorting testing
- Pagination testing
- Category management testing
- MongoDB aggregation pipeline verification
- Administrative dashboard testing
- API validation testing
- Protected route testing
- Centralized error handling verification
- Customer website integration testing
- Responsive layout testing
- End-to-end integration testing

---

# Future Enhancements

Potential future enhancements include:

- Role-based administrative authorization
- Image uploads through cloud storage
- Reservation and booking functionality
- Review moderation
- Destination recommendations
- Administrative analytics
- Reporting enhancements
- Customer favorites and wish lists

---

# Author

**Kevin Crandall**

Bachelor of Science – Computer Science

Southern New Hampshire University

CS-499 Computer Science Capstone