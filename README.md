<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Simple Account System API

A comprehensive banking system API built with NestJS featuring customer management, account operations, and transaction processing.

## 🚀 Live Deployment

- **API Base URL**: [https://simple-account-esl1.vercel.app/api/v1](https://simple-account-esl1.vercel.app/api/v1)
- **API Documentation**: [https://documenter.getpostman.com/view/14522308/2sB3Wwpc9Z](https://documenter.getpostman.com/view/14522308/2sB3Wwpc9Z)

## 🚀 Local Deployment

- **API Base URL**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- **API Documentation**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## 📋 API Features

### Authentication

- User registration and login with JWT
- Role-based access control (Admin, Manager, Teller)
- Password management and profile handling

### Customer Management

- Create and manage customer profiles
- Search and pagination
- Contact information and personal details

### Account Management

- Create savings/checking accounts
- Account status management (Active, Inactive, Suspended)
- Balance tracking and updates

### Transaction Processing

- Deposit and withdrawal operations
- Transaction history with filtering
- Real-time balance updates
- Insufficient funds validation

## 🛠️ Technology Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Vercel
- **Validation**: Class Validator & Class Transformer

## 🔑 Authentication

The API uses JWT Bearer authentication. Include the token in your requests:

```http
Authorization: Bearer your-jwt-token
```

🏗️ Project Structure
src/
├── auth/ # Authentication module
├── customers/ # Customer management
├── accounts/ # Account operations
├── transactions/ # Transaction processing
├── common/ # Shared utilities & decorators
└── prisma/ # Database configuration

🔧 Project Setup

# Install dependencies

$ yarn install

# Development

$ yarn run start:dev

# Production build

$ yarn run build

# Production mode

$ yarn run start:prod

🧪 Running Tests

# unit tests

$ yarn run test

# e2e tests

$ yarn run test:e2e

# test coverage

$ yarn run test:cov
📊 API Endpoints
Authentication
POST /auth/register - User registration

POST /auth/login - User login

POST /auth/logout - User logout

GET /auth/profile - Get user profile

PATCH /auth/change-password - Change password

Customers
POST /customers - Create customer (Admin/Manager)

GET /customers - List customers (Admin/Manager/Teller)

GET /customers/:id - Get customer by ID

PUT /customers/:id - Update customer (Admin/Manager)

Accounts
POST /customers/:customerId/accounts - Create account

GET /customers/:customerId/accounts - List customer accounts

GET /accounts/:id - Get account by ID

PUT /customers/:customerId/accounts/:accountId - Update account

Transactions
POST /accounts/:accountId/transactions - Create transaction

GET /accounts/:accountId/transactions - List account transactions

GET /transactions/:id - Get transaction by ID

🔒 Role-Based Access Control
ADMIN: Full access to all operations

MANAGER: Customer and account management

TELLER: Read-only access to customers and transactions

🌐 Deployment
This application is deployed on Vercel with PostgreSQL database. For local development, set up your environment variables:

env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_jwt_secret"
NODE_ENV="development"

📚 Resources
Visit the NestJS Documentation to learn more about the framework.

For questions and support, please visit our Discord channel.

To dive deeper and get more hands-on experience, check out our official video courses.

Deploy your application to AWS with the help of NestJS Mau in just a few clicks.

Visualize your application graph and interact with the NestJS application in real-time using NestJS Devtools.

🤝 Support
Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please read more here.

📄 License
This project is MIT licensed.
