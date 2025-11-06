# VocaloCart Project Overview

## Project Description
VocaloCart is a full-stack e-commerce platform for Vocaloid merchandise, featuring a Spring Boot backend and React frontend.

## Technology Stack

### Backend
- **Framework:** Spring Boot 3.x
- **Language:** Java 17
- **Database:** MySQL 8.0 (AWS RDS)
- **Security:** Spring Security with JWT
- **Build Tool:** Maven
- **Containerization:** Docker

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** CSS/Styled Components
- **HTTP Client:** Axios
- **State Management:** React Context API

### Infrastructure
- **Cloud Provider:** AWS
- **Compute:** ECS Fargate (Serverless Containers)
- **Container Registry:** AWS ECR
- **Database:** AWS RDS MySQL
- **Region:** ap-northeast-2 (Seoul)
- **Logging:** CloudWatch Logs

## Project Structure

```
v_shop/
├── vocaloidshop/                    # Backend (Spring Boot)
│   ├── src/main/java/
│   │   └── mjyuu/vocaloidshop/
│   │       ├── config/              # Security, App configuration
│   │       ├── controller/          # REST API endpoints
│   │       ├── dto/                 # Data Transfer Objects
│   │       ├── entity/              # JPA Entities
│   │       ├── repository/          # Database repositories
│   │       ├── security/            # JWT, Authentication
│   │       ├── service/             # Business logic
│   │       └── util/                # Utilities
│   ├── src/main/resources/
│   │   └── application.yml          # Configuration
│   ├── Dockerfile                   # Container configuration
│   ├── pom.xml                      # Maven dependencies
│   └── deploy-ecs-simple.sh         # AWS deployment script
│
├── vocaloid_front/                  # Frontend (React)
│   ├── src/
│   │   ├── api/                     # API configuration
│   │   ├── components/              # React components
│   │   ├── context/                 # Context providers
│   │   ├── hooks/                   # Custom hooks
│   │   ├── pages/                   # Page components
│   │   ├── router/                  # React Router config
│   │   └── services/                # API services
│   ├── package.json
│   └── vite.config.ts
│
└── docs/                            # Documentation
    ├── 01_PROJECT_OVERVIEW.md       # This file
    ├── 02_BACKEND_SETUP.md          # Backend setup guide
    ├── 03_FRONTEND_SETUP.md         # Frontend setup guide
    ├── 04_AWS_DEPLOYMENT.md         # AWS deployment guide
    └── 05_API_DOCUMENTATION.md      # API endpoints reference
```

## Key Features

### Completed Features
- ✅ User authentication (Register/Login with JWT)
- ✅ Product catalog with categories
- ✅ Shopping cart management
- ✅ Order processing
- ✅ Admin product management
- ✅ RESTful API
- ✅ Docker containerization
- ✅ AWS ECS Fargate deployment
- ✅ Database integration with RDS

### Planned Features
- 🔲 Payment integration
- 🔲 Email notifications
- 🔲 Product reviews
- 🔲 Order history
- 🔲 Admin dashboard
- 🔲 Search functionality
- 🔲 Product filtering

## Database Schema

### Main Tables
- **users** - User accounts and authentication
- **products** - Product catalog
- **categories** - Product categories
- **cart_items** - Shopping cart
- **orders** - Order information
- **order_items** - Order line items

## API Architecture

### Authentication Flow
1. User registers/logs in → Backend issues JWT token
2. Frontend stores token in localStorage
3. All API requests include JWT in Authorization header
4. Backend validates token on each request

### CORS Configuration
Backend configured to accept requests from any origin (`@CrossOrigin(origins = "*")`)

## Current Deployment

### Production Environment
- **Backend URL:** `http://16.184.51.237:8081/api`
- **Frontend URL:** `http://localhost:5173` (Development)
- **Database:** AWS RDS MySQL (mydb.czwaweqgeexp.ap-northeast-2.rds.amazonaws.com)

### AWS Resources
- **ECS Cluster:** vocalocart-cluster
- **ECS Service:** vocalocart-backend-service
- **Task Definition:** vocalocart-backend:1
- **ECR Repository:** vocalocart-backend
- **Security Groups:** 
  - sg-084bf69e0f723f92f (ECS - port 8081)
  - sg-0a69340d7a2f1cf0e (RDS - port 3306)

## Development Timeline

1. **Backend Development** - Spring Boot application with full CRUD operations
2. **Frontend Development** - React SPA with routing and state management
3. **Local Docker Setup** - Containerized backend for local testing
4. **AWS RDS Setup** - MySQL database in cloud
5. **AWS Deployment** - ECS Fargate serverless deployment
6. **Integration** - Connected frontend to AWS backend

## Environment Variables

### Backend (Spring Boot)
- `SPRING_DATASOURCE_URL` - Database connection string
- `SPRING_DATASOURCE_USERNAME` - Database user
- `SPRING_DATASOURCE_PASSWORD` - Database password
- `SERVER_PORT` - Application port (8081)
- `JPA_DDL_AUTO` - Hibernate DDL mode (update)
- `MAIL_HOST` - SMTP server (SendGrid)
- `MAIL_PORT` - SMTP port (587)
- `MAIL_USERNAME` - SMTP username

### Frontend (React)
- Backend URL configured in `src/api/axiosConfig.ts`

## Quick Start Commands

### Backend
```bash
# Build
cd vocaloidshop
mvn clean package

# Run locally
java -jar target/vocaloidshop-0.0.1-SNAPSHOT.jar

# Build Docker image
docker build -t vocaloidshop-backend .

# Deploy to AWS
bash deploy-ecs-simple.sh
```

### Frontend
```bash
# Install dependencies
cd vocaloid_front
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Support & Maintenance

### Monitoring
- CloudWatch Logs: `/ecs/vocalocart-backend`
- ECS Service Health: AWS Console → ECS → Clusters → vocalocart-cluster

### Common Issues
- **IP Changes:** ECS Fargate public IP changes on restart
- **CORS Errors:** Backend has CORS enabled for all origins
- **Database Connection:** Verify RDS security group allows ECS access

## Next Steps
See individual documentation files for detailed setup and deployment instructions.
