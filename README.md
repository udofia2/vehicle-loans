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

```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



