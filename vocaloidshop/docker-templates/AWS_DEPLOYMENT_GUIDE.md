# 🚀 AWS Deployment Guide for VocaloCart Backend

## 📋 Overview

This guide covers deploying your Dockerized Spring Boot backend to AWS using three methods:

1. **AWS ECS Fargate** (Recommended) - Serverless container orchestration
2. **AWS Elastic Beanstalk** - Simplest, managed platform
3. **AWS ECS on EC2** - More control, cost-effective for steady workloads

**Your Current Setup:**
- ✅ Docker image built: `vocaloidshop-backend:latest`
- ✅ Database: AWS RDS MySQL (already configured)
- ✅ Application tested locally on port 8081
- ✅ Health checks configured

---

## 🎯 Method 1: AWS ECS Fargate (Recommended)

**Best for:** Production deployments, auto-scaling, no server management

### Prerequisites

```bash
# Install AWS CLI (if not already installed)
# Windows (using Chocolatey)
choco install awscli

# Or download from: https://aws.amazon.com/cli/

# Verify installation
aws --version

# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region (e.g., ap-northeast-2)
# Enter default output format: json
```

### Step 1: Create ECR Repository

```bash
# Create a repository in Elastic Container Registry
aws ecr create-repository \
  --repository-name vocalocart-backend \
  --region ap-northeast-2

# Get the repository URI (save this - you'll need it)
aws ecr describe-repositories \
  --repository-names vocalocart-backend \
  --region ap-northeast-2 \
  --query 'repositories[0].repositoryUri' \
  --output text
```

**Expected output:** `123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend`

### Step 2: Push Docker Image to ECR

```bash
# Get ECR login token and authenticate Docker
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com

# Tag your local image with ECR repository URI
docker tag vocaloidshop-backend:latest 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest

# Push to ECR
docker push 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest
```

### Step 3: Create ECS Cluster

```bash
# Create a Fargate cluster
aws ecs create-cluster \
  --cluster-name vocalocart-cluster \
  --region ap-northeast-2
```

### Step 4: Create Task Definition

Create a file named `task-definition.json`:

```json
{
  "family": "vocalocart-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "vocalocart-backend",
      "image": "123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest",
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
          "name": "MAIL_HOST",
          "value": "smtp.sendgrid.net"
        },
        {
          "name": "MAIL_PORT",
          "value": "587"
        },
        {
          "name": "MAIL_USERNAME",
          "value": "apikey"
        },
        {
          "name": "SERVER_PORT",
          "value": "8081"
        },
        {
          "name": "JPA_DDL_AUTO",
          "value": "update"
        }
      ],
      "secrets": [
        {
          "name": "SPRING_DATASOURCE_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:ap-northeast-2:YOUR_ACCOUNT_ID:secret:vocalocart/db-password"
        },
        {
          "name": "MAIL_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:ap-northeast-2:YOUR_ACCOUNT_ID:secret:vocalocart/sendgrid-api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/vocalocart-backend",
          "awslogs-region": "ap-northeast-2",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8081/actuator/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

**Important:** Before using this file:
1. Replace `YOUR_ACCOUNT_ID` with your AWS account ID
2. Replace ECR image URI with your actual URI from Step 1

### Step 5: Store Secrets in AWS Secrets Manager

```bash
# Store database password
aws secretsmanager create-secret \
  --name vocalocart/db-password \
  --secret-string "DoodyDanks48" \
  --region ap-northeast-2

# Store SendGrid API key
aws secretsmanager create-secret \
  --name vocalocart/sendgrid-api-key \
  --secret-string "YOUR_SENDGRID_API_KEY" \
  --region ap-northeast-2
```

### Step 6: Create IAM Role for ECS Task Execution

```bash
# Create trust policy file
cat > trust-policy.json << EOF
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
EOF

# Create the role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://trust-policy.json

# Attach AWS managed policy for ECS task execution
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Create policy for Secrets Manager access
cat > secrets-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:ap-northeast-2:YOUR_ACCOUNT_ID:secret:vocalocart/*"
      ]
    }
  ]
}
EOF

# Attach secrets policy
aws iam put-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-name SecretsManagerAccess \
  --policy-document file://secrets-policy.json
```

### Step 7: Create CloudWatch Log Group

```bash
aws logs create-log-group \
  --log-group-name /ecs/vocalocart-backend \
  --region ap-northeast-2
```

### Step 8: Register Task Definition

```bash
# Update task-definition.json with your actual values, then:
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --region ap-northeast-2
```

### Step 9: Create ECS Service with Load Balancer

First, create a security group:

```bash
# Get your VPC ID
VPC_ID=$(aws ec2 describe-vpcs --query 'Vpcs[0].VpcId' --output text --region ap-northeast-2)

# Create security group for ECS tasks
aws ec2 create-security-group \
  --group-name vocalocart-ecs-sg \
  --description "Security group for VocaloCart ECS tasks" \
  --vpc-id $VPC_ID \
  --region ap-northeast-2

# Get the security group ID
SG_ID=$(aws ec2 describe-security-groups \
  --filters Name=group-name,Values=vocalocart-ecs-sg \
  --query 'SecurityGroups[0].GroupId' \
  --output text \
  --region ap-northeast-2)

# Allow inbound traffic on port 8081
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 8081 \
  --cidr 0.0.0.0/0 \
  --region ap-northeast-2
```

Now create the service:

```bash
# Get subnet IDs
SUBNET_IDS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'Subnets[*].SubnetId' \
  --output text \
  --region ap-northeast-2)

# Convert space-separated to comma-separated
SUBNET_IDS=$(echo $SUBNET_IDS | tr ' ' ',')

# Create ECS service
aws ecs create-service \
  --cluster vocalocart-cluster \
  --service-name vocalocart-backend-service \
  --task-definition vocalocart-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_IDS],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
  --region ap-northeast-2
```

### Step 10: Get Public IP and Test

```bash
# Get task ARN
TASK_ARN=$(aws ecs list-tasks \
  --cluster vocalocart-cluster \
  --service-name vocalocart-backend-service \
  --query 'taskArns[0]' \
  --output text \
  --region ap-northeast-2)

# Get task details
aws ecs describe-tasks \
  --cluster vocalocart-cluster \
  --tasks $TASK_ARN \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text \
  --region ap-northeast-2

# Get public IP from network interface (ENI ID from previous command)
ENI_ID="eni-xxxxx"  # Replace with actual ENI ID
PUBLIC_IP=$(aws ec2 describe-network-interfaces \
  --network-interface-ids $ENI_ID \
  --query 'NetworkInterfaces[0].Association.PublicIp' \
  --output text \
  --region ap-northeast-2)

echo "Your backend is accessible at: http://$PUBLIC_IP:8081"

# Test the deployment
curl http://$PUBLIC_IP:8081/actuator/health
curl http://$PUBLIC_IP:8081/swagger-ui.html
```

---

## 🎯 Method 2: AWS Elastic Beanstalk (Simplest)

**Best for:** Quick deployment, minimal AWS knowledge required

### Step 1: Install EB CLI

#### Windows Installation:

**⚠️ IMPORTANT: You must restart VS Code completely after Python installation for PATH to update!**

**Method 1: Using Python (Recommended)**

1. **Close VS Code completely** (File → Exit)
2. **Reopen VS Code**
3. Open a **new terminal** and run:

```bash
python -m pip install awsebcli --upgrade --user
```

4. Add Python Scripts to PATH:
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to **Advanced** → **Environment Variables**
   - Under **User variables**, select **Path** → **Edit**
   - Click **New** and add: `%USERPROFILE%\AppData\Roaming\Python\Python312\Scripts`
   - Click **OK** on all dialogs

5. **Restart terminal** and verify:
```bash
eb --version
```

**Method 2: Using AWS EB CLI Setup Script (Alternative)**

Open **PowerShell as Administrator** and run:

```powershell
# Clone the setup repository
git clone https://github.com/aws/aws-elastic-beanstalk-cli-setup.git
cd aws-elastic-beanstalk-cli-setup

# Run the bundled installer
python .\scripts\ebcli_installer.py

# Add to PATH (replace USERNAME with your Windows username)
$env:Path += ";C:\Users\USERNAME\.ebcli-virtual-env\executables"

# Verify
eb --version
```

**Method 3: Direct pip3 Installation (If pip3 is available)**

```bash
pip3 install awsebcli --upgrade --user
eb --version
```

### Step 2: Create Dockerrun.aws.json

**Create a file named `Dockerrun.aws.json` (case-sensitive!)** in your `vocaloidshop` directory:

```bash
# Path: vocaloidshop/Dockerrun.aws.json
```

```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": 8081,
      "HostPort": 8081
    }
  ],
  "Environment": [
    {
      "Name": "SPRING_DATASOURCE_URL",
      "Value": "jdbc:mysql://mydb.czwaweqgeexp.ap-northeast-2.rds.amazonaws.com:3306/vocalocart?serverTimezone=Asia/Seoul&characterEncoding=UTF-8"
    },
    {
      "Name": "SPRING_DATASOURCE_USERNAME",
      "Value": "root"
    }
  ]
}
```

**⚠️ Important Notes:**
- Filename MUST be exactly `Dockerrun.aws.json` (capital D, capital R)
- Replace `123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest` with your actual ECR image URI
- Replace RDS endpoint with your actual RDS endpoint
- Do NOT commit database passwords here - use `eb setenv` for secrets (Step 3)

### Step 3: Initialize and Deploy

```bash
# Initialize Elastic Beanstalk application
eb init -p docker -r ap-northeast-2 vocalocart-backend

# Create environment and deploy
eb create vocalocart-prod --instance-type t3.small

# Set environment variables (secrets)
eb setenv SPRING_DATASOURCE_PASSWORD="DoodyDanks48" \
  MAIL_PASSWORD="YOUR_SENDGRID_API_KEY" \
  FRONTEND_BASE_URL="http://your-frontend-url.com"

# Open in browser
eb open
```

### Step 4: Monitor and Update

```bash
# View logs
eb logs

# Check status
eb status

# SSH into instance
eb ssh

# Deploy updates
docker build -t vocaloidshop-backend:latest .
docker push 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest
eb deploy
```

---

## 🎯 Method 3: AWS ECS on EC2 (Cost-Effective)

**Best for:** Predictable workloads, more control, lower cost

### Quick Setup

```bash
# Create ECS cluster with EC2 instances
aws ecs create-cluster --cluster-name vocalocart-ec2-cluster --region ap-northeast-2

# Launch EC2 instances with ECS-optimized AMI
# Use AWS Console or CLI to launch t3.small instances
# Make sure to select ECS-optimized AMI and add to cluster

# Follow Steps 4-10 from Method 1, but use EC2 launch type instead of FARGATE
aws ecs create-service \
  --cluster vocalocart-ec2-cluster \
  --service-name vocalocart-backend-service \
  --task-definition vocalocart-backend \
  --desired-count 1 \
  --launch-type EC2 \
  --region ap-northeast-2
```

---

## 💰 Cost Comparison

### ECS Fargate
- **Compute:** ~$15-20/month (0.5 vCPU, 1GB RAM, 24/7)
- **Data Transfer:** ~$5/month
- **Load Balancer:** ~$16/month (if used)
- **Total:** ~$36-41/month

### Elastic Beanstalk
- **EC2 t3.small:** ~$15/month
- **Load Balancer:** ~$16/month
- **Data Transfer:** ~$5/month
- **Total:** ~$36/month

### ECS on EC2
- **EC2 t3.small:** ~$15/month
- **Data Transfer:** ~$5/month
- **Total:** ~$20/month (most cost-effective)

**Note:** RDS costs are separate (already running)

---

## 🔒 Security Best Practices

### 1. Update RDS Security Group

```bash
# Get your ECS security group ID
ECS_SG_ID="sg-xxxxx"  # From previous steps

# Get your RDS security group
RDS_SG_ID=$(aws rds describe-db-instances \
  --db-instance-identifier mydb \
  --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' \
  --output text \
  --region ap-northeast-2)

# Allow ECS tasks to access RDS
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG_ID \
  --protocol tcp \
  --port 3306 \
  --source-group $ECS_SG_ID \
  --region ap-northeast-2
```

### 2. Use HTTPS with ALB (Application Load Balancer)

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name vocalocart-alb \
  --subnets $SUBNET_ID_1 $SUBNET_ID_2 \
  --security-groups $ALB_SG_ID \
  --region ap-northeast-2

# Create target group
aws elbv2 create-target-group \
  --name vocalocart-tg \
  --protocol HTTP \
  --port 8081 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-path /actuator/health \
  --region ap-northeast-2

# Register SSL certificate (AWS Certificate Manager)
# Then create HTTPS listener on ALB
```

### 3. Environment Variables Security

**Never hardcode secrets in task definition!** Use AWS Secrets Manager (as shown in Method 1).

---

## 📊 Monitoring & Logging

### CloudWatch Dashboard

```bash
# View logs
aws logs tail /ecs/vocalocart-backend --follow --region ap-northeast-2

# Create CloudWatch alarm for high CPU
aws cloudwatch put-metric-alarm \
  --alarm-name vocalocart-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --region ap-northeast-2
```

---

## 🔄 CI/CD Pipeline (Bonus)

### GitHub Actions Workflow

Create `.github/workflows/deploy-aws.yml`:

```yaml
name: Deploy to AWS ECS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ap-northeast-2
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
    
    - name: Build and push Docker image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        ECR_REPOSITORY: vocalocart-backend
        IMAGE_TAG: ${{ github.sha }}
      run: |
        cd vocaloidshop
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
    
    - name: Update ECS service
      run: |
        aws ecs update-service \
          --cluster vocalocart-cluster \
          --service vocalocart-backend-service \
          --force-new-deployment \
          --region ap-northeast-2
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] AWS CLI installed and configured
- [ ] Docker image tested locally
- [ ] Environment variables documented
- [ ] RDS database accessible
- [ ] SendGrid API key ready

### Deployment
- [ ] ECR repository created
- [ ] Docker image pushed to ECR
- [ ] Secrets stored in Secrets Manager
- [ ] ECS cluster created
- [ ] Task definition registered
- [ ] Security groups configured
- [ ] ECS service created and running

### Post-Deployment
- [ ] Health check endpoint responds
- [ ] Swagger UI accessible
- [ ] Database connection working
- [ ] Logs showing no errors
- [ ] CloudWatch monitoring setup
- [ ] Frontend updated with new backend URL

---

## 🚀 Quick Start Script

Save this as `deploy-to-aws.sh`:

```bash
#!/bin/bash

# Variables - CHANGE THESE
AWS_REGION="ap-northeast-2"
AWS_ACCOUNT_ID="YOUR_ACCOUNT_ID"
ECR_REPO="vocalocart-backend"
CLUSTER_NAME="vocalocart-cluster"
SERVICE_NAME="vocalocart-backend-service"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying VocaloCart Backend to AWS...${NC}"

# Step 1: Create ECR repository
echo -e "${GREEN}Creating ECR repository...${NC}"
aws ecr create-repository --repository-name $ECR_REPO --region $AWS_REGION 2>/dev/null || echo "Repository already exists"

# Step 2: Get ECR login
echo -e "${GREEN}Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Step 3: Tag and push image
echo -e "${GREEN}Pushing image to ECR...${NC}"
docker tag vocaloidshop-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest

# Step 4: Update ECS service (if exists)
echo -e "${GREEN}Updating ECS service...${NC}"
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --force-new-deployment \
  --region $AWS_REGION 2>/dev/null || echo "Service doesn't exist yet - create it manually first"

echo -e "${BLUE}✅ Deployment complete!${NC}"
```

Make it executable: `chmod +x deploy-to-aws.sh`

---

## 🆘 Troubleshooting

### Issue: Task keeps stopping

Check logs:
```bash
aws logs tail /ecs/vocalocart-backend --follow --region ap-northeast-2
```

Common causes:
- Database connection failure → Check RDS security group
- Missing environment variables → Verify task definition
- Out of memory → Increase memory allocation

### Issue: Cannot access public IP

- Check security group allows inbound on port 8081
- Verify `assignPublicIp=ENABLED` in network configuration
- Check if task is in RUNNING state

### Issue: Health check failing

- Verify `/actuator/health` endpoint works locally
- Check startPeriod is long enough (60-120 seconds)
- Ensure wget is available in container

---

## 📚 Next Steps

1. **Set up Domain:** Use Route 53 for custom domain
2. **Add HTTPS:** Get SSL certificate from ACM
3. **Auto Scaling:** Configure based on CPU/memory
4. **Monitoring:** Set up CloudWatch dashboards
5. **Backups:** Enable automated RDS backups
6. **CDN:** Use CloudFront for static assets

---

**Need help?** Check AWS ECS documentation: https://docs.aws.amazon.com/ecs/
