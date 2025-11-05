# ✅ VocaloCart AWS ECS Fargate Deployment - SUCCESS

**Deployment Date:** 2025-11-05  
**Deployment Method:** AWS ECS Fargate (switched from Elastic Beanstalk after 4 failed attempts)

---

## 🌐 Deployed Application

### Public Access
- **Base URL:** `http://52.79.227.77:8081`
- **API Endpoint:** `http://52.79.227.77:8081/api/products`
- **Status:** ✅ RUNNING

### Test Results
```bash
# Products API Test
curl http://52.79.227.77:8081/api/products
# Response: HTTP 200 - 23 products returned ✓

# Example Product
{
  "id":1,
  "name":"미쿠 셔츠",
  "price":4200,
  "imageUrl":"https://example.com/miku-shirt.png",
  "categoryName":"의류"
}
```

---

## 🏗️ AWS Infrastructure Created

### ECS Fargate
- **Cluster:** `vocalocart-cluster`
- **Service:** `vocalocart-backend-service`
- **Task Definition:** `vocalocart-backend:1`
- **Running Tasks:** 1
- **Launch Type:** Fargate (Serverless)
- **CPU:** 512 units (0.5 vCPU)
- **Memory:** 1024 MB (1 GB)

### Networking
- **VPC:** vpc-0a00d5dd74ebc32b9 (Default VPC)
- **Subnets:** 4 availability zones
- **Public IP:** 52.79.227.77 (Elastic Network Interface)
- **Security Group:** sg-084bf69e0f723f92f
  - Inbound: Port 8081 from 0.0.0.0/0
  - Outbound: All traffic

### Container Registry (ECR)
- **Repository:** `410766693536.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend`
- **Image Tag:** `latest`
- **Image Size:** 809 MB
- **Image Digest:** sha256:86b278986c3868a76d7349228983aeae5fff2deb09c6addbb5c472e8ad31f0aa

### Database (RDS MySQL)
- **Endpoint:** mydb.czwaweqgeexp.ap-northeast-2.rds.amazonaws.com:3306
- **Database Name:** vocalocart
- **Security Group:** sg-0a69340d7a2f1cf0e
  - Allows inbound from ECS security group (sg-084bf69e0f723f92f) on port 3306 ✓

### IAM Role
- **Role:** ecsTaskExecutionRole
- **Policies:**
  - AmazonECSTaskExecutionRolePolicy (AWS Managed)
  - ECRAccessPolicy (Custom - ECR pull permissions)
  - CloudWatchLogsPolicy (Custom - Log creation/writing)

### CloudWatch Logs
- **Log Group:** /ecs/vocalocart-backend
- **Auto-created:** Yes
- **Retention:** Default (never expire)

---

## 📋 Deployment Timeline

### Phase 1: Elastic Beanstalk Attempts (FAILED)
1. **Attempt 1** - docker-compose conflict → Moved files
2. **Attempt 2** - Wrong directory → Changed to vocaloidshop
3. **Attempt 3** - .gitignore issue → Commented Dockerfile
4. **Attempt 4** - Git staging → Added files  
**Decision:** Switched to ECS Fargate (more reliable, no git issues)

### Phase 2: ECS Fargate Deployment (SUCCESS)
1. ✅ Pushed Docker image to ECR (8 layers, 809MB)
2. ✅ Created ECS cluster
3. ✅ Registered task definition with environment variables
4. ✅ Created security group (allow port 8081)
5. ✅ Created ECS service with Fargate launch type
6. ⚠️ Fixed IAM role (ecsTaskExecutionRole) - missing trust relationship
7. ⚠️ Added ECR permissions (GetAuthorizationToken)
8. ⚠️ Added CloudWatch Logs permissions (CreateLogGroup)
9. ✅ Updated RDS security group (allow ECS → RDS:3306)
10. ✅ Service deployed and running
11. ✅ API tested successfully (HTTP 200, 23 products)

**Total Time:** ~45 minutes (including troubleshooting)  
**IAM Issues Fixed:** 3 (role trust, ECR access, CloudWatch logs)

---

## 🔧 Configuration Files Created

### 1. deploy-ecs-simple.sh
Automated deployment script for ECS Fargate:
- Creates ECS cluster
- Registers task definition
- Sets environment variables

### 2. task-definition-simple.json
ECS task definition with:
- Spring Boot container configuration
- Database connection strings
- Port mappings (8081)
- Health check (wget localhost:8081/actuator/health)
- CloudWatch Logs integration

### 3. ecs-task-execution-trust-policy.json
IAM trust policy allowing ECS to assume role

### 4. ecr-access-policy.json
IAM policy for ECR image pulling:
- ecr:GetAuthorizationToken
- ecr:BatchCheckLayerAvailability
- ecr:GetDownloadUrlForLayer
- ecr:BatchGetImage

### 5. cloudwatch-logs-policy.json
IAM policy for CloudWatch Logs:
- logs:CreateLogGroup
- logs:CreateLogStream
- logs:PutLogEvents

---

## 💰 AWS Free Tier Eligibility

### Included in Free Tier (12 months)
- ✅ **ECS Fargate:** 
  - 20 GB-Hours per day (compute)
  - 10 GB-Hours per day (ephemeral storage)
  - Current usage: ~12 GB-Hours/day (0.5 vCPU × 24 hours)
  
- ✅ **RDS MySQL:** 
  - 750 hours/month of db.t3.micro
  - 20 GB storage
  
- ✅ **ECR:**
  - 500 MB storage per month
  - Current: 809 MB (⚠️ exceeds free tier by 309 MB ≈ $0.03/month)
  
- ✅ **CloudWatch Logs:**
  - 5 GB ingestion per month
  - 5 GB storage
  
- ✅ **Data Transfer:**
  - 100 GB outbound per month

### Estimated Monthly Cost
- **Within Free Tier:** $0.00 (compute, logs, data transfer)
- **ECR Overage:** ~$0.03/month (309 MB × $0.10/GB)
- **Total:** ~$0.03/month

---

## 🔄 Maintenance Commands

### View Service Status
```bash
aws ecs describe-services \
  --cluster vocalocart-cluster \
  --services vocalocart-backend-service \
  --region ap-northeast-2 \
  --query "services[0].{Status:status,RunningCount:runningCount}" \
  --output json
```

### Get Current Public IP
```bash
TASK_ARN=$(aws ecs list-tasks --cluster vocalocart-cluster --service-name vocalocart-backend-service --region ap-northeast-2 --query "taskArns[0]" --output text)
ENI=$(aws ecs describe-tasks --cluster vocalocart-cluster --tasks $TASK_ARN --region ap-northeast-2 --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value|[0]" --output text)
aws ec2 describe-network-interfaces --network-interface-ids $ENI --region ap-northeast-2 --query "NetworkInterfaces[0].Association.PublicIp" --output text
```

### View Logs (Use AWS Console - CLI has Windows path issues)
1. Go to: https://console.aws.amazon.com/cloudwatch/
2. Navigate to: Logs → Log groups → /ecs/vocalocart-backend
3. Select latest log stream

### Redeploy (Pull Latest Image)
```bash
aws ecs update-service \
  --cluster vocalocart-cluster \
  --service vocalocart-backend-service \
  --force-new-deployment \
  --region ap-northeast-2
```

### Stop Service (Save Costs)
```bash
aws ecs update-service \
  --cluster vocalocart-cluster \
  --service vocalocart-backend-service \
  --desired-count 0 \
  --region ap-northeast-2
```

### Start Service
```bash
aws ecs update-service \
  --cluster vocalocart-cluster \
  --service vocalocart-backend-service \
  --desired-count 1 \
  --region ap-northeast-2
```

---

## 🚀 Next Steps

### 1. Frontend Integration
Update your React frontend (vocalocart-frontend) to use new backend:

**File:** `src/services/api.ts`
```typescript
const API_BASE_URL = 'http://52.79.227.77:8081/api';
```

### 2. Add Load Balancer (Optional - Not Free Tier)
For production, add Application Load Balancer:
- Provides SSL/TLS (HTTPS)
- Custom domain name
- Better health checks
- Cost: ~$16/month (not free tier)

### 3. Add Domain Name (Optional)
- Register domain via Route 53 or external provider
- Point A record to: 52.79.227.77
- Example: api.vocalocart.com → 52.79.227.77:8081

### 4. Enable HTTPS (Requires ALB)
- Request SSL certificate via AWS Certificate Manager (ACM)
- Attach to Application Load Balancer
- Update frontend to use https:// URLs

### 5. Set Up CI/CD (GitHub Actions)
Automate deployment on git push:
- Build Docker image
- Push to ECR
- Update ECS service

### 6. Monitor Application
- CloudWatch Logs: Application logs
- CloudWatch Metrics: CPU, Memory usage
- Set up alarms for service failures

---

## 🐛 Known Issues & Solutions

### Issue 1: Public IP Changes on Restart
- **Cause:** Fargate tasks get new IPs when redeployed
- **Solution:** Use Application Load Balancer for static DNS name

### Issue 2: CORS Errors from Frontend
- **Status:** May occur if frontend is on different domain
- **Solution:** Backend has CORS enabled (`@CrossOrigin(origins = "*")`)

### Issue 3: Container Stops Unexpectedly
- **Check:** CloudWatch Logs → /ecs/vocalocart-backend
- **Common Causes:**
  - Database connection failure
  - Out of memory (increase memory in task definition)
  - Application crash (check logs for exceptions)

### Issue 4: 502 Bad Gateway
- **Cause:** Container not healthy or starting up
- **Wait:** 30-60 seconds for Spring Boot to start
- **Check:** Health status in ECS console

---

## 📞 Support Resources

- **AWS ECS Documentation:** https://docs.aws.amazon.com/ecs/
- **AWS Free Tier Details:** https://aws.amazon.com/free/
- **Spring Boot on AWS:** https://spring.io/guides/gs/spring-boot-docker/
- **Project Repository:** /c/Users/rwoo1/Documents/VSCodeProjects/v_shop

---

## ✅ Deployment Checklist

- [x] Docker image built and pushed to ECR
- [x] ECS cluster created
- [x] Task definition registered
- [x] IAM role configured with all permissions
- [x] Security groups configured (ECS, RDS)
- [x] ECS service running with 1 task
- [x] Database connectivity verified
- [x] API endpoints tested and working
- [x] CloudWatch Logs enabled
- [ ] Frontend updated with new backend URL
- [ ] Custom domain configured (optional)
- [ ] Load balancer added (optional)
- [ ] CI/CD pipeline set up (optional)

---

**🎉 Congratulations! Your VocaloCart backend is now deployed on AWS!**

Test it now:
```bash
curl http://52.79.227.77:8081/api/products
```
