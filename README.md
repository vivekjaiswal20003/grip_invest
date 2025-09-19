# Grip Invest Full Stack Application

This project is a full-stack investment management platform featuring a React frontend, a Node.js (Express) backend, and a MySQL database. The entire application is containerized using Docker for easy setup and deployment.

## Features

- **User Authentication**: Secure signup/login with JWT, password reset, and OTP verification.
- **Investment Products**: Admins can create, read, update, and delete investment products. Users can browse all products.
- **Portfolio Management**: Users can invest in products, view their portfolio, and see expected returns.
- **Transaction Logging**: All API activities are logged for administrative review.
- **AI-Powered Insights**:
  - Get feedback on password strength during signup.
  - Automatically generate product descriptions.
  - Receive personalized portfolio analysis and recommendations.
  - Summarize user error logs for quick debugging.

## Project Structure

The project is organized into two main directories: `frontend` and `backend`.

### Backend (`/backend`)

The backend is a Node.js application built with Express.js and Sequelize.

```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/  # Handles incoming requests and sends responses.
│   │   ├── middlewares/  # Custom middleware for auth, errors, logging, etc.
│   │   ├── routes/       # Defines the API routes.
│   │   └── validations/  # Request validation rules.
│   ├── config/         # Database and mailer configuration.
│   ├── models/         # Sequelize database models.
│   ├── services/       # Business logic (AI, investments, etc.).
│   ├── tests/          # Jest tests.
│   └── utils/          # Reusable utility functions.
│   └── index.js        # The main entry point for the backend application.
├── .env              # Environment variables.
├── Dockerfile        # Docker configuration for the backend.
└── package.json      # Backend dependencies and scripts.
```

### Frontend (`/frontend`)

The frontend is a React application created with Create React App.

```
frontend/
├── src/
│   ├── api/          # Functions for making API calls to the backend.
│   ├── components/   # Reusable React components (Header, Footer, etc.).
│   ├── context/      # React context for authentication.
│   ├── pages/        # Individual pages of the application.
│   ├── tests/        # React Testing Library tests.
│   └── App.js        # The main application component with routing.
├── .env            # Environment variables for the frontend.
├── Dockerfile      # Docker configuration for the frontend.
└── package.json    # Frontend dependencies and scripts.
```

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### 1. Environment Configuration

Create a file named `.env` in the root directory (`E:\grip--investment`) and add the following content. Replace the placeholder values with your own.

```env
# Database Configuration
DB_HOST=db
DB_USER=root
DB_PASSWORD=your_strong_password
DB_NAME=grip_invest

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key

# Email (for OTP service)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=user@example.com
MAIL_PASS=password

# Google AI API Key
GOOGLE_API_KEY=your_google_ai_api_key
```

### 2. Running the Application

With Docker running, execute the following command from the root directory of the project:

```bash
docker-compose up --build
```

This command will build the Docker images and start all services. To run in the background, use the `-d` flag.

### 3. Seeding the Database

After the containers are running, seed the database with initial data:

```bash
docker-compose exec backend npm run seed
```

### 4. Accessing the Services

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3002](http://localhost:3002)
- **Backend Health Check**: [http://localhost:3002/health](http://localhost:3002/health)

### Default Users

- **Admin User**: `admin@example.com` / `admin123`
- **Regular User**: `user@example.com` / `user123`

## API Documentation

All endpoints are prefixed with `/api`.

### Authentication (`/auth`)

- `POST /signup`: Register a new user.
  - **Body**: `{ "firstName", "lastName", "email", "password", "riskAppetite" }`
- `POST /login`: Authenticate a user and get a JWT.
  - **Body**: `{ "email", "password" }`
- `POST /forgot-password`: Send a password reset OTP to the user's email.
  - **Body**: `{ "email" }`
- `POST /reset-password`: Reset the password using a valid OTP.
  - **Body**: `{ "email", "otp", "password" }`
- `POST /password-strength`: Get AI-powered feedback on password strength.
  - **Body**: `{ "password" }`

### Products (`/products`)

- `GET /`: Get a list of all investment products. (Public)
- `GET /:id`: Get a single product by its ID. (Public)
- `POST /`: Create a new product. (Admin only)
- `PUT /:id`: Update a product. (Admin only)
- `DELETE /:id`: Delete a product. (Admin only)
- `GET /recommendations`: Get AI-powered product recommendations for the logged-in user. (Private)

### Investments (`/investments`)

- `POST /`: Create a new investment. (Private)
  - **Body**: `{ "productId", "amount" }`
- `GET /`: Get the logged-in user's investment portfolio. (Private)
- `GET /summary`: Get an AI-powered summary of the user's portfolio risk. (Private)

### Users (`/users`)

- `GET /profile`: Get the profile of the logged-in user. (Private)
- `PUT /profile`: Update the profile of the logged-in user. (Private)

### Logs (`/logs`)

- `GET /`: Get a list of all transaction logs. (Admin only)
  - **Query Params**: `userId`, `email`

## Running Tests

To run the backend tests, execute the following command:

```bash
docker-compose exec backend npm test
```

To run the frontend tests:

```bash
docker-compose exec frontend npm test
```

## AI Usage Notes

This project leverages Google's Gemini AI for several intelligent features. The implementation can be found in `backend/src/services/ai.service.js`. An active `GOOGLE_API_KEY` is required in your `.env` file for these features to work.