# vehicle-loans Backend API

🚀 A comprehensive Vehicle Valuation and Loan Management System built with NestJS, TypeORM, and SQLite.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Test Coverage](https://img.shields.io/badge/coverage-12.5%25-yellow)]()
[![API Version](https://img.shields.io/badge/api-v1-blue)]()
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)]()
[![NestJS](https://img.shields.io/badge/nestjs-11.x-red)]()

## 🎯 Overview

vehicle-loans Backend API is a production-ready system for vehicle loan processing, featuring vehicle data management, real-time valuations, loan eligibility checking, and offer management. Built following Domain-Driven Design principles with comprehensive testing and API documentation.

## ✨ Features

### 🚗 Vehicle Management

- **VIN Lookup Integration**: Real-time vehicle data from external APIs
- **Manual Vehicle Entry**: Complete vehicle information management
- **Vehicle Search**: Advanced filtering by make, model, year, etc.
- **Data Validation**: Comprehensive input validation and sanitization

### 💰 Vehicle Valuation

- **External API Integration**: Real-time vehicle valuation services
- **Valuation History**: Track price changes over time
- **Multiple Sources**: Support for various valuation providers
- **Caching Strategy**: Optimized performance with intelligent caching

### 🏦 Loan Management

- **Application Processing**: Complete loan application workflow
- **Eligibility Engine**: Advanced eligibility checking algorithms
- **Status Tracking**: Real-time application status updates
- **Document Management**: Secure handling of application documents

### 💳 Loan Offers

- **Dynamic Calculations**: Real-time payment calculations
- **Multiple Terms**: Flexible loan term options (12-60 months)
- **Competitive Rates**: Market-competitive interest rates
- **Offer Management**: Accept, decline, and counter-offer functionality

### 🔧 Technical Features

- **RESTful API**: Clean, intuitive API design following REST principles
- **Swagger Documentation**: Interactive API documentation with testing interface
- **Type Safety**: Full TypeScript implementation with strict typing
- **Database Management**: SQLite with TypeORM for development, production-ready
- **Validation**: Comprehensive input validation using class-validator
- **Error Handling**: Structured error responses with proper HTTP status codes
- **Logging**: Structured logging with correlation IDs
- **Testing**: Unit tests with Jest framework (27 tests, 8 test suites)
- **Security**: CORS, input sanitization, and security headers

## 🛠 Tech Stack

### Backend Framework

- **NestJS 11.x**: Modern, scalable Node.js framework
- **TypeScript 5.x**: Static typing and modern JavaScript features
- **RxJS**: Reactive programming support

### Database & ORM

- **SQLite3**: Lightweight, serverless database (in-memory for development)
- **TypeORM 0.3.x**: Feature-rich Object-Relational Mapping
- **Database Migrations**: Automated schema management

### Validation & Transformation

- **class-validator**: Decorator-based validation
- **class-transformer**: Object transformation and serialization
- **Joi**: Environment variable validation

### Documentation & Testing

- **Swagger/OpenAPI**: Interactive API documentation
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library

### External Integrations

- **VIN Lookup API**: Vehicle identification number decoding
- **Valuation API**: Real-time vehicle price estimation
- **HTTP Client**: Axios for external API communication

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >= 18.0.0 (LTS recommended)
- **npm**: >= 8.0.0
- **Git**: For version control

### Installation

```bash
# Clone the repository
git clone git@github.com:udofia2/vehicle-loans.git
cd vehicle-loans

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Build the application
npm run build

# Start development server with hot reload
npm run start:dev
```

### Environment Configuration

Update `.env` file with your configuration:

```env
# Application
NODE_ENV=development
PORT=3000
APP_NAME=vehicle-loans Backend API
APP_VERSION=1.0.0
APP_PREFIX=api/v1

# Database (SQLite in-memory for development)
DB_TYPE=sqlite
DB_DATABASE=:memory:
DB_SYNCHRONIZE=true
DB_LOGGING=true

# External APIs (obtain from providers)
VIN_API_KEY=your_vin_api_key
VALUATION_API_KEY=your_valuation_api_key
```

### 📋 Available Scripts

```bash
# 🔨 Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start in debug mode
npm run start:prod         # Start production build

# 🏗 Building
npm run build              # Build for production
npm run prebuild           # Clean build directory

# 🧪 Testing
npm test                   # Run all unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage report
npm run test:e2e           # Run end-to-end tests
npm run test:debug         # Run tests in debug mode

# 📝 Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Auto-fix linting issues
npm run format             # Format code with Prettier
npm run format:check       # Check formatting without fixing
```

## 📚 API Documentation

Once the server is running, access the comprehensive API documentation:

- **📖 Swagger UI**: http://localhost:3000/api/docs
- **🌐 API Base URL**: http://localhost:3000/api/v1
- **💾 API JSON**: http://localhost:3000/api/docs-json

### 🔗 Available Endpoints

#### 🚗 Vehicles (`/api/v1/vehicles`)

- `POST /` - Create vehicle from VIN or manual entry
- `GET /` - List vehicles with search and pagination
- `GET /:id` - Get vehicle by ID
- `GET /vin/:vin` - Get vehicle by VIN
- `PUT /:id` - Update vehicle information
- `DELETE /:id` - Delete vehicle
- `GET /decode/:vin` - Decode VIN for vehicle information
- `GET /search` - Advanced vehicle search

#### 💰 Valuations (`/api/v1/valuations`)

- `POST /` - Request vehicle valuation
- `GET /vehicle/:vehicleId` - Get valuations for vehicle
- `GET /:id` - Get valuation by ID

#### 🏦 Loan Applications (`/api/v1/loans`)

- `POST /` - Submit loan application
- `GET /` - List loan applications
- `GET /:id` - Get loan application details
- `PATCH /:id/status` - Update application status
- `POST /:id/check-eligibility` - Check loan eligibility

#### 💳 Offers (`/api/v1/offers`)

- `POST /` - Create loan offer
- `GET /loan/:loanApplicationId` - Get offers for loan application
- `GET /:id` - Get offer details
- `PATCH /:id/accept` - Accept offer
- `PATCH /:id/decline` - Decline offer

## 📁 Project Structure

```
src/
├── main.ts                 # Application bootstrap
├── app.module.ts           # Root application module
│
├── config/                 # 🔧 Configuration
│   ├── app.config.ts      # Application settings
│   └── database.config.ts # Database configuration
│
├── database/               # 🗄️ Database management
│   └── database.module.ts # TypeORM configuration
│
├── common/                 # 🔄 Shared components
│   ├── constants/         # Application constants
│   ├── enums/            # Shared enumerations
│   ├── services/         # Logger and shared services
│   ├── filters/          # Exception filters
│   ├── interceptors/     # HTTP interceptors
│   ├── pipes/            # Validation pipes
│   └── dto/              # Common DTOs
│
├── modules/               # 🏗️ Feature modules
│   ├── vehicle/          # 🚗 Vehicle management
│   │   ├── controllers/  # REST controllers
│   │   ├── services/     # Business logic
│   │   ├── entities/     # TypeORM entities
│   │   ├── dto/          # Data transfer objects
│   │   └── repositories/ # Data access layer
│   │
│   ├── valuation/        # 💰 Vehicle valuation
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   ├── dto/
│   │   └── repositories/
│   │
│   ├── loan/             # 🏦 Loan applications
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── entities/
│   │   ├── dto/
│   │   └── repositories/
│   │
│   └── offers/           # 💳 Loan offers
│       ├── controllers/
│       ├── services/
│       ├── entities/
│       ├── dto/
│       └── repositories/
│
└── integration/           # 🔗 External API integrations
    ├── vin-lookup/       # VIN decoding service
    └── valuation-api/    # Vehicle valuation API

test/                      # 🧪 Test files
├── unit/                 # Unit tests (27 tests across 8 suites)
└── fixtures/             # Test data fixtures
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



