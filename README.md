# Authentication Service

## Overview
This is an authentication service built using Node.js, Express, and MongoDB. It provides user registration, login, token-based authentication, and rate-limiting for security.

## Features
- User Registration
- User Login with JWT Authentication
- Token Refresh Mechanism
- Rate Limiting to Prevent Abuse
- Middleware for Token Verification

## Technologies Used
- Node.js
- Express.js
- MongoDB (Mongoose)
- bcrypt.js (for password hashing)
- jsonwebtoken (JWT for authentication)
- express-rate-limit (to limit requests per IP)
- dotenv (to manage environment variables)

## Prerequisites
- Node.js (>=14.x)
- MongoDB (Local or Cloud Instance)
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/PAE-2025/jisebi-checker-auth-service
   cd jisebi-checker-auth-service
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and set up the following environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```sh
   npm start
   ```

## API Endpoints

### 1. Home Route
**GET /**
- Returns a simple message indicating the service is running.

### 2. Register User
**POST /register**
- Request Body:
  ```json
  {
    "username": "exampleUser",
    "password": "examplePassword"
  }
  ```
- Response:
  ```json
  {
    "message": "User registered successfully"
  }
  ```

### 3. Login User
**POST /login**
- Request Body:
  ```json
  {
    "username": "exampleUser",
    "password": "examplePassword"
  }
  ```
- Response:
  ```json
  {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expireAt": 1691234567
  }
  ```

### 4. Refresh Token
**POST /refresh**
- Request Body:
  ```json
  {
    "refreshToken": "your_refresh_token"
  }
  ```
- Response:
  ```json
  {
    "accessToken": "new_jwt_access_token",
    "expireAt": 1691237890
  }
  ```

### 5. Verify Token
**POST /verify-token** (Protected Route)
- Requires `Authorization` header with a valid JWT.
- Response:
  ```json
  {
    "valid": true,
    "user": { "id": "userId" }
  }
  ```

## Security Measures
- **Rate Limiting**: Prevents excessive login attempts.
- **Password Hashing**: Uses bcrypt to securely store passwords.
- **JWT Authentication**: Ensures secure access to protected routes.

## Repository
- GitHub: [jisebi-checker-auth-service](https://github.com/PAE-2025/jisebi-checker-auth-service)


