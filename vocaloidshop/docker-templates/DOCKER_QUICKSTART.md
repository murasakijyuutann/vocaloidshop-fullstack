# 🚀 Quick Docker Commands Cheat Sheet

## Build & Run (Production with AWS RDS)

```bash
# 1. Navigate to backend folder
cd vocaloidshop

# 2. Build the Docker image
docker build -t vocalocart-backend .

# 3. Run with docker-compose (RECOMMENDED)
docker-compose -f docker-compose.prod.yml up -d

# OR run directly with docker
docker run -d \
  --name vocalocart-backend \
  -p 8081:8081 \
  --env-file .env \
  vocalocart-backend
```

## Essential Commands

```bash
# View logs
docker logs -f vocalocart-backend

# Stop container
docker stop vocalocart-backend

# Remove container
docker rm vocalocart-backend

# Restart container
docker restart vocalocart-backend

# Check status
docker ps

# Check health
curl http://localhost:8081/actuator/health
```

## Rebuild After Code Changes

```bash
# With docker-compose
docker-compose -f docker-compose.prod.yml up -d --build

# With docker
docker stop vocalocart-backend
docker rm vocalocart-backend
docker build -t vocalocart-backend .
docker run -d --name vocalocart-backend -p 8081:8081 --env-file .env vocalocart-backend
```

## Troubleshooting

```bash
# Check logs for errors
docker logs --tail 100 vocalocart-backend

# Enter container shell
docker exec -it vocalocart-backend bash

# Check running processes
docker exec -it vocalocart-backend ps aux

# Check resource usage
docker stats vocalocart-backend

# Clean rebuild (no cache)
docker build --no-cache -t vocalocart-backend .
```

## ⚠️ Common Issues

### Port already in use
```bash
# Find what's using port 8081
netstat -ano | findstr :8081

# Use different port
docker run -d -p 8082:8081 ...
```

### Database connection fails
- Check `.env` file has correct DB_URL
- Verify AWS RDS security group allows your IP
- Test connection: `mysql -h your-rds-endpoint -u root -p`

### Container exits immediately
```bash
# Check logs for errors
docker logs vocalocart-backend

# Common fixes:
# - Verify all env vars in .env
# - Check database is accessible
# - Ensure port 8081 is free
```

## 📁 Files Created

- ✅ `Dockerfile` - Multi-stage build configuration
- ✅ `.dockerignore` - Files to exclude from build
- ✅ `docker-compose.yml` - Dev setup with MySQL
- ✅ `docker-compose.prod.yml` - Production setup
- ✅ `DOCKER_GUIDE.md` - Comprehensive guide
- ✅ `pom.xml` - Added actuator dependency
- ✅ `application.yml` - Added health check config
