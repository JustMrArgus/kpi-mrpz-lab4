# Task Manager API

A robust RESTful API for comprehensive management of tasks, categories, and users. Built with Node.js, Express, and MongoDB (Mongoose), providing a secure and efficient backend for task management applications.

## Made by

- Oleksandr Rodina (Олександр Родіна) IM-33
- Kyryl Kozarezov (Кирил Козарезов) IM-33

## Features

### Design Document

[LINK](https://docs.google.com/document/d/1r5xrrpwsCMhqZkDyWCGo4-a4P_WJI_dTbonNYhnqNJo/edit?tab=t.0)

### User Management

- Secure user registration and login with JWT authentication
- Role-based authorization (User and Admin roles)
- Secure password storage using bcryptjs hashing

### Task Management

- Full CRUD operations for tasks
- Task association with categories and users
- Filtering by status, priority, and category
- Support for due dates and tags

### Category Management

- Full CRUD operations for categories
- User-specific categories ensuring data privacy

### Data Validation

- Robust input validation using express-validator

### RESTful Architecture

- Clean and intuitive API endpoints following REST principles

### Scalable & Maintainable

- Modular design with clear separation of concerns
- Stateless JWT authentication for horizontal scaling

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB
- Docker (optional)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/JustMrArgus/kpi-mrpz-lab4.git
cd task-manager-api
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

Example:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_strong_secret_key_here
```

### Running the Application

Start MongoDB server (in a separate terminal):

```bash
mongod
```

Start the application:

```bash
npm run start
```

For development mode (with nodemon):

```bash
npm run dev
```

### Using Docker

```bash
sudo docker-compose up --build
```

## Running Tests

```bash
npm run test
```

### Using Docker for Tests

```bash
sudo docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
```
