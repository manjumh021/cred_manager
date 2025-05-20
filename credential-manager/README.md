# Credential Manager

A secure application for managing client credentials across various platforms like GoDaddy, Namecheap, HostGator, WordPress, Azure, and more. This application allows you to store, manage, and export credentials in Excel format for backup purposes.

## Features

- Secure credential storage with encryption
- Client management
- Platform categorization
- User role-based access control
- Activity logging for audit trails
- Excel export functionality for backup
- Responsive UI for easy access

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker

## Prerequisites

- Docker and Docker Compose
- Node.js (v14 or higher)
- npm or yarn

## Getting Started

### Using Docker (Recommended)

1. Clone the repository
2. Copy the example environment file and modify as needed:
   ```
   cp .env.example .env
   ```
3. Start the application using Docker Compose:
   ```
   docker-compose up -d
   ```
4. Access the application at http://localhost:3000

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example` in the root directory
4. Start the backend server:
   ```
   npm start
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the frontend development server:
   ```
   npm start
   ```
4. Access the application at http://localhost:3000

## Database Setup

The application uses MySQL as the database. The schema is defined in `db_schema.sql`. You can set up the database manually by running this SQL script or let Docker handle it automatically.

## Default Admin User

After setting up the database, a default admin user is created:

- Username: admin
- Password: AdminSecurePass123

**Important**: Change the default admin password after the first login for security reasons.

## Export Functionality

The application allows you to export credentials in Excel format for backup purposes. You can export:

- All credentials
- Credentials for a specific client
- Credentials for a specific platform

## Security Considerations

- All credentials are encrypted in the database
- JWT is used for authentication
- Role-based access control is implemented
- Activity logging for audit trails

## License

This project is licensed under the MIT License - see the LICENSE file for details.