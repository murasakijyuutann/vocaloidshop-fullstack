# AWS ECS Fargate Deployment Guide

## Overview
This guide covers deploying the VocaloCart Spring Boot backend to AWS ECS Fargate - a serverless container platform.

## Why ECS Fargate?
- ✅ **Serverless** - No EC2 instances to manage
- ✅ **Free Tier** - 20 GB-Hours compute per day (12 months)
- ✅ **Scalable** - Auto-scales based on demand
- ✅ **Reliable** - No git/directory issues (unlike Elastic Beanstalk)
- ✅ **Simple** - Direct Docker image deployment

## Prerequisites

### Required Tools
- AWS CLI 2.x
- Docker Desktop
- AWS Account with free tier
- Git

### AWS Credentials
1. Go to AWS Console → IAM → Users → Your User
2. Click "Security credentials" tab
3. Create Access Key → CLI
4. Save Access Key ID and Secret Access Key

### Configure AWS CLI
```bash
aws configure
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: ap-northeast-2
# Default output format: json
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   AWS Cloud                         │
│  ┌──────────────────────────────────────────────┐  │
│  │          ECS Fargate (ap-northeast-2)        │  │
│  │                                              │  │
│  │  ┌────────────────────────────────────┐     │  │
│  │  │   vocalocart-cluster               │     │  │
│  │  │                                    │     │  │
│  │  │  ┌──────────────────────────┐     │     │  │
│  │  │  │  vocalocart-backend-     │     │     │  │
│  │  │  │  service (Fargate)       │     │     │  │
│  │  │  │                          │     │     │  │
│  │  │  │  Tasks: 1                │     │     │  │
│  │  │  │  CPU: 512 (0.5 vCPU)     │     │     │  │
│  │  │  │  Memory: 1024 MB         │     │     │  │
│  │  │  │  Port: 8081              │     │     │  │
│  │  │  └──────────────────────────┘     │     │  │
│  │  └────────────────────────────────────┘     │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │   ECR (Container Registry)                   │  │
│  │   vocalocart-backend:latest (809MB)          │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │   RDS MySQL                                  │  │
│  │   mydb.czwaweqgeexp.ap-northeast-2...        │  │
│  │   Database: vocalocart                       │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │   CloudWatch Logs                            │  │
│  │   /ecs/vocalocart-backend                    │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘

Public Internet ─────> 16.184.51.237:8081
```

## Deployment Steps

### Step 1: Build Docker Image

```bash
cd C:/Users/rwoo1/Documents/VSCodeProjects/v_shop/vocaloidshop

# Build JAR file
mvn clean package -DskipTests

# Build Docker image
docker build -t vocaloidshop-backend:latest .

# Verify image
docker images | grep vocaloidshop-backend
```

**Expected Output:**
```
vocaloidshop-backend   latest   86b278986c38   6 hours ago   809MB
```

### Step 2: Create ECR Repository

```bash
# Get your AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo $AWS_ACCOUNT_ID

# Create ECR repository
aws ecr create-repository \
  --repository-name vocalocart-backend \
  --region ap-northeast-2
```

**If already exists:** You'll see "RepositoryAlreadyExistsException" - that's okay!

### Step 3: Push Docker Image to ECR

```bash
# Login to ECR
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin \
  ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com

# Tag image
docker tag vocaloidshop-backend:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest

# Push image
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest
```

**Expected Output:**
```
The push refers to repository [410766693536.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend]
latest: digest: sha256:86b278986c3868a76d7349228983aeae5fff2deb09c6addbb5c472e8ad31f0aa size: 856
```

### Step 4: Run Deployment Script

We have an automated script that creates everything:

```bash
bash deploy-ecs-simple.sh
```

This script:
1. Creates ECS cluster
2. Registers task definition with environment variables
3. Shows next steps for creating the service

**Manual Steps (if not using script):**

#### 4a. Create ECS Cluster
```bash
aws ecs create-cluster \
  --cluster-name vocalocart-cluster \
  --region ap-northeast-2
```

#### 4b. Create Task Execution Role

**Create trust policy file:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**Create role:**
```bash
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://ecs-task-execution-trust-policy.json

# Attach AWS managed policy
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Add CloudWatch Logs permissions
aws iam put-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-name CloudWatchLogsPolicy \
  --policy-document file://cloudwatch-logs-policy.json
```

#### 4c. Register Task Definition

The script creates `task-definition-simple.json` automatically. Key settings:

```json
{
  "family": "vocalocart-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "vocalocart-backend",
      "image": "410766693536.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest",
      "portMappings": [
        {
          "containerPort": 8081,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_DATASOURCE_URL",
          "value": "jdbc:mysql://mydb.czwaweqgeexp.ap-northeast-2.rds.amazonaws.com:3306/vocalocart?serverTimezone=Asia/Seoul&characterEncoding=UTF-8"
        },
        {
          "name": "SPRING_DATASOURCE_USERNAME",
          "value": "root"
        },
        {
          "name": "SPRING_DATASOURCE_PASSWORD",
          "value": "DoodyDanks48"
        }
      ]
    }
  ]
}
```

Register it:
```bash
aws ecs register-task-definition \
  --cli-input-json file://task-definition-simple.json \
  --region ap-northeast-2
```

### Step 5: Create Security Group

```bash
# Get default VPC ID
VPC_ID=$(aws ec2 describe-vpcs \
  --region ap-northeast-2 \
  --filters "Name=is-default,Values=true" \
  --query "Vpcs[0].VpcId" \
  --output text)

# Create security group
SG_ID=$(aws ec2 create-security-group \
  --group-name vocalocart-backend-sg \
  --description "Security group for VocaloCart backend" \
  --vpc-id $VPC_ID \
  --region ap-northeast-2 \
  --query "GroupId" \
  --output text)

# Allow inbound traffic on port 8081
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 8081 \
  --cidr 0.0.0.0/0 \
  --region ap-northeast-2
```

### Step 6: Create ECS Service

```bash
# Get subnet IDs
SUBNETS=$(aws ec2 describe-subnets \
  --region ap-northeast-2 \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query "Subnets[*].SubnetId" \
  --output text | tr '\t' ',')

# Create service
aws ecs create-service \
  --cluster vocalocart-cluster \
  --service-name vocalocart-backend-service \
  --task-definition vocalocart-backend:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
  --region ap-northeast-2
```

### Step 7: Configure RDS Security Group

Allow ECS to access RDS:

```bash
# Get RDS security group ID
RDS_SG=$(aws rds describe-db-instances \
  --region ap-northeast-2 \
  --query "DBInstances[?DBInstanceIdentifier=='mydb'].VpcSecurityGroups[0].VpcSecurityGroupId" \
  --output text)

# Allow ECS security group to access RDS
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG \
  --protocol tcp \
  --port 3306 \
  --source-group $SG_ID \
  --region ap-northeast-2
```

### Step 8: Wait for Deployment

```bash
# Check service status
aws ecs describe-services \
  --cluster vocalocart-cluster \
  --services vocalocart-backend-service \
  --region ap-northeast-2 \
  --query "services[0].{Status:status,RunningCount:runningCount,DesiredCount:desiredCount}"
```

**Wait until `RunningCount: 1`** (takes 2-3 minutes)

### Step 9: Get Public IP

```bash
# Get task ARN
TASK_ARN=$(aws ecs list-tasks \
  --cluster vocalocart-cluster \
  --service-name vocalocart-backend-service \
  --region ap-northeast-2 \
  --desired-status RUNNING \
  --query "taskArns[0]" \
  --output text)

# Get network interface ID
ENI=$(aws ecs describe-tasks \
  --cluster vocalocart-cluster \
  --tasks $TASK_ARN \
  --region ap-northeast-2 \
  --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value|[0]" \
  --output text)

# Get public IP
PUBLIC_IP=$(aws ec2 describe-network-interfaces \
  --network-interface-ids $ENI \
  --region ap-northeast-2 \
  --query "NetworkInterfaces[0].Association.PublicIp" \
  --output text)

echo "🌐 Public URL: http://$PUBLIC_IP:8081/api"
```

### Step 10: Test Deployment

```bash
# Test products API
curl http://$PUBLIC_IP:8081/api/products

# Test categories API
curl http://$PUBLIC_IP:8081/api/categories
```

**Expected:** JSON response with products/categories

## Troubleshooting

### Issue 1: IAM Role Errors

**Error:** "ECS was unable to assume the role"

**Solution:** Create/update IAM role with correct permissions:
- Trust policy must allow `ecs-tasks.amazonaws.com`
- Must have `AmazonECSTaskExecutionRolePolicy`
- Must have CloudWatch Logs permissions

### Issue 2: ECR Pull Failed

**Error:** "unable to pull secrets or registry auth"

**Solution:** Add ECR permissions to task execution role:
```json
{
  "Effect": "Allow",
  "Action": [
    "ecr:GetAuthorizationToken",
    "ecr:BatchCheckLayerAvailability",
    "ecr:GetDownloadUrlForLayer",
    "ecr:BatchGetImage"
  ],
  "Resource": "*"
}
```

### Issue 3: Container Stopped

**Check stopped reason:**
```bash
aws ecs describe-tasks \
  --cluster vocalocart-cluster \
  --tasks $TASK_ARN \
  --region ap-northeast-2 \
  --query "tasks[0].{StoppedReason:stoppedReason,Containers:containers[0].{ExitCode:exitCode,Reason:reason}}"
```

**Common causes:**
- Database connection failed (check RDS security group)
- Out of memory (increase memory in task definition)
- Application crash (check CloudWatch Logs)

### Issue 4: Cannot Access Public IP

**Verify security group:**
```bash
aws ec2 describe-security-groups \
  --group-ids $SG_ID \
  --region ap-northeast-2 \
  --query "SecurityGroups[0].IpPermissions"
```

**Should allow:** Port 8081 from 0.0.0.0/0

### Issue 5: Database Connection Timeout

**Check RDS security group:**
```bash
aws ec2 describe-security-groups \
  --group-ids $RDS_SG \
  --region ap-northeast-2 \
  --query "SecurityGroups[0].IpPermissions"
```

**Should allow:** Port 3306 from ECS security group

## Viewing Logs

### Via AWS Console
1. Go to: https://console.aws.amazon.com/cloudwatch/
2. Navigate to: Logs → Log groups → `/ecs/vocalocart-backend`
3. Select latest log stream
4. View application logs

### Via AWS CLI (Alternative)
```bash
# Note: May have path issues on Windows Git Bash
# Use AWS Console instead for easier log viewing
```

## Updating Deployment

### Update Application Code

1. **Make code changes**
2. **Rebuild:**
   ```bash
   mvn clean package -DskipTests
   docker build -t vocaloidshop-backend:latest .
   ```

3. **Push new image:**
   ```bash
   docker tag vocaloidshop-backend:latest \
     ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest
   
   docker push ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest
   ```

4. **Force new deployment:**
   ```bash
   aws ecs update-service \
     --cluster vocalocart-cluster \
     --service vocalocart-backend-service \
     --force-new-deployment \
     --region ap-northeast-2
   ```

5. **Wait 2-3 minutes** for new task to start

6. **Get new public IP** (IP changes on restart):
   ```bash
   # Use commands from Step 9 above
   ```

## Cost Optimization

### Free Tier Usage (12 months)
- ✅ **ECS Fargate:** 20 GB-Hours/day compute
  - Current: 0.5 vCPU × 24h = 12 GB-Hours/day ✅
- ✅ **ECR:** 500 MB storage
  - Current: 809 MB ⚠️ ($0.03/month overage)
- ✅ **CloudWatch Logs:** 5 GB ingestion/month
- ✅ **Data Transfer:** 100 GB outbound/month

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

## Cleanup (Delete Everything)

**⚠️ WARNING: This deletes all AWS resources**

```bash
# Delete service
aws ecs update-service \
  --cluster vocalocart-cluster \
  --service vocalocart-backend-service \
  --desired-count 0 \
  --region ap-northeast-2

aws ecs delete-service \
  --cluster vocalocart-cluster \
  --service vocalocart-backend-service \
  --region ap-northeast-2

# Delete cluster
aws ecs delete-cluster \
  --cluster vocalocart-cluster \
  --region ap-northeast-2

# Delete ECR repository
aws ecr delete-repository \
  --repository-name vocalocart-backend \
  --force \
  --region ap-northeast-2

# Delete security group
aws ec2 delete-security-group \
  --group-id $SG_ID \
  --region ap-northeast-2
```

## Next Steps

### Add Load Balancer (Optional - Not Free)
For production use:
- Application Load Balancer for static DNS
- SSL/TLS certificate via ACM
- Custom domain name
- Cost: ~$16/month

### Set Up CI/CD
Automate deployment with GitHub Actions:
- Build on `git push`
- Push to ECR
- Update ECS service

### Add Monitoring
- CloudWatch alarms for service failures
- CPU/Memory metrics
- Custom application metrics

## Current Deployment

**Status:** ✅ DEPLOYED  
**Public URL:** `http://16.184.51.237:8081/api`  
**Cluster:** vocalocart-cluster  
**Service:** vocalocart-backend-service  
**Tasks:** 1 running  
**Database:** Connected to RDS MySQL  

**Last Updated:** 2025-11-05
