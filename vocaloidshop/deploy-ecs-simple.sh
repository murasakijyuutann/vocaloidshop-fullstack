#!/bin/bash

# Simple ECS Fargate Deployment Script
# This deploys your Docker container to AWS ECS Fargate (FREE tier eligible for 12 months)

set -e

REGION="ap-northeast-2"
CLUSTER_NAME="vocalocart-cluster"
SERVICE_NAME="vocalocart-backend-service"
TASK_FAMILY="vocalocart-backend"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_IMAGE="$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/vocalocart-backend:latest"

echo "🚀 Deploying VocaloCart Backend to AWS ECS Fargate..."
echo "AWS Account: $AWS_ACCOUNT_ID"
echo "Region: $REGION"

# Create ECS Cluster (if doesn't exist)
echo "📦 Creating ECS Cluster..."
aws ecs create-cluster \
  --cluster-name $CLUSTER_NAME \
  --region $REGION \
  2>/dev/null || echo "Cluster already exists"

# Create task definition JSON
cat > task-definition-simple.json <<EOF
{
  "family": "$TASK_FAMILY",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "vocalocart-backend",
      "image": "$ECR_IMAGE",
      "essential": true,
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
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/vocalocart-backend",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs",
          "awslogs-create-group": "true"
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
  ],
  "executionRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskExecutionRole"
}
EOF

echo "📝 Registering task definition..."
aws ecs register-task-definition \
  --cli-input-json file://task-definition-simple.json \
  --region $REGION

echo "✅ Task definition registered!"
echo ""
echo "Next steps:"
echo "1. Go to AWS Console → ECS → Clusters"
echo "2. Click on '$CLUSTER_NAME'"
echo "3. Create a service:"
echo "   - Launch type: Fargate"
echo "   - Task definition: $TASK_FAMILY"
echo "   - Service name: $SERVICE_NAME"
echo "   - Number of tasks: 1"
echo "   - VPC: Default VPC"
echo "   - Subnets: Select all"
echo "   - Security group: Allow port 8081"
echo "   - Public IP: ENABLED"
echo ""
echo "Or I can help you create the service via CLI - just ask!"
