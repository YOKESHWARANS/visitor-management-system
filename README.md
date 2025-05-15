# Visitor Registration System

## Project Setup

### Prerequisites
- Node.js
- MySQL

### Database Setup
1. Create a MySQL database named `visitor_db`
2. The application will automatically create the required tables on startup

### Environment Setup
1. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=visitor_db
```

### Installation
1. Install server dependencies:
```
cd server
npm install
```

2. Install client dependencies:
```
cd client
npm install
```

### Run the Application
1. Start the server:
```
cd server
npm start
```

2. Start the client:
```
cd client
npm run dev
```

## Features
- Visitor registration
- Admin dashboard for monitoring and managing visitors
- Self-checkout system for visitors
- Entry code generation for security

## Dependencies
### Server
- express
- mysql2
- cors
- dotenv
- moment
- uuid

### Client
- react
- react-router-dom
- axios
- react-toastify

## Admin Access
- Username: admin
- Password: 123

## Database Schema

### Visitors Table
```sql
CREATE TABLE IF NOT EXISTS visitors (
  id VARCHAR(36) PRIMARY KEY,
  visitorName VARCHAR(100) NOT NULL,
  mobileNumber VARCHAR(15) NOT NULL,
  apartmentNumber VARCHAR(50) NOT NULL,
  vehicleType VARCHAR(50) DEFAULT 'None',
  vehicleNumber VARCHAR(50),
  purpose VARCHAR(200) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  timeOfVisit DATETIME NOT NULL,
  entryCode VARCHAR(20) NOT NULL,
  exitTime DATETIME NULL,
  status ENUM('active', 'exited') DEFAULT 'active'
)
```