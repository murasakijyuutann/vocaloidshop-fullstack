#!/bin/bash

# VocaloCart Backend IP Checker
# Use this script to quickly get the current public IP of your ECS Fargate backend

echo "🔍 Checking VocaloCart backend IP..."
echo ""

# Get running task ARN
TASK_ARN=$(aws ecs list-tasks \
  --cluster vocalocart-cluster \
  --service-name vocalocart-backend-service \
  --region ap-northeast-2 \
  --desired-status RUNNING \
  --query "taskArns[0]" \
  --output text)

if [ "$TASK_ARN" == "None" ] || [ -z "$TASK_ARN" ]; then
  echo "❌ No running tasks found!"
  echo "Check service status:"
  echo "  aws ecs describe-services --cluster vocalocart-cluster --services vocalocart-backend-service --region ap-northeast-2"
  exit 1
fi

echo "✓ Task found: ${TASK_ARN##*/}"

# Get network interface ID
ENI=$(aws ecs describe-tasks \
  --cluster vocalocart-cluster \
  --tasks $TASK_ARN \
  --region ap-northeast-2 \
  --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value|[0]" \
  --output text)

if [ -z "$ENI" ]; then
  echo "❌ Could not get network interface!"
  exit 1
fi

echo "✓ Network interface: $ENI"

# Get public IP
PUBLIC_IP=$(aws ec2 describe-network-interfaces \
  --network-interface-ids $ENI \
  --region ap-northeast-2 \
  --query "NetworkInterfaces[0].Association.PublicIp" \
  --output text)

if [ -z "$PUBLIC_IP" ]; then
  echo "❌ Could not get public IP!"
  exit 1
fi

echo ""
echo "🌐 ================================"
echo "   Current Backend IP: $PUBLIC_IP"
echo "   ================================"
echo ""
echo "📝 Update your frontend .env file:"
echo ""
echo "   VITE_API_URL=http://$PUBLIC_IP:8081/api"
echo ""
echo "🧪 Test the backend:"
echo ""
echo "   curl http://$PUBLIC_IP:8081/api/products"
echo ""
