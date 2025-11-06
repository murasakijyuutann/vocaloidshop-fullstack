# AWS Static IP Setup with Application Load Balancer

## The Problem: Changing IP Addresses

### Why IP Changes
ECS Fargate tasks get new public IPs when:
- Container restarts (crash, health check failure)
- You force new deployment
- AWS maintenance (rare)
- Task is replaced for any reason

### Impact
- ❌ Frontend breaks every time backend restarts
- ❌ Can't share stable URL
- ❌ Must manually update `.env` file
- ❌ Requires running long command to find new IP

---

## Solution 1: Application Load Balancer (Recommended)

### What is ALB?
- AWS service that distributes traffic to your containers
- Provides static DNS name (never changes)
- Supports SSL/HTTPS
- Health checks and auto-recovery
- Can route to multiple containers

### Benefits
- ✅ Static DNS endpoint (e.g., `vocalocart-alb-123456.ap-northeast-2.elb.amazonaws.com`)
- ✅ No more IP changes
- ✅ Can add custom domain (api.vocalocart.com)
- ✅ SSL/HTTPS support
- ✅ Better for production

### Cost
- ⚠️ **~$16-18/month** (NOT free tier)
- Breakdown:
  - ALB: ~$16/month (720 hours × $0.0225/hour)
  - Data processing: ~$0.008 per GB
- Worth it for production, not needed for development

---

## Step-by-Step: Add Application Load Balancer

### Prerequisites
- ECS service already running (completed ✅)
- VPC and subnets (already have ✅)
- Security groups (already have ✅)

---

### Step 1: Create Target Group

Target group connects ALB to your ECS tasks.

```bash
# Create target group
aws elbv2 create-target-group \
  --name vocalocart-backend-tg \
  --protocol HTTP \
  --port 8081 \
  --vpc-id vpc-0a00d5dd74ebc32b9 \
  --target-type ip \
  --health-check-enabled \
  --health-check-protocol HTTP \
  --health-check-path /actuator/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region ap-northeast-2
```

**Save the Target Group ARN from output!**

Example output:
```json
{
  "TargetGroups": [
    {
      "TargetGroupArn": "arn:aws:elasticloadbalancing:ap-northeast-2:410766693536:targetgroup/vocalocart-backend-tg/abc123",
      ...
    }
  ]
}
```

---

### Step 2: Create Application Load Balancer

```bash
# Get all subnet IDs
SUBNETS=$(aws ec2 describe-subnets \
  --region ap-northeast-2 \
  --filters "Name=vpc-id,Values=vpc-0a00d5dd74ebc32b9" \
  --query "Subnets[*].SubnetId" \
  --output text | tr '\t' ' ')

# Create ALB security group
ALB_SG=$(aws ec2 create-security-group \
  --group-name vocalocart-alb-sg \
  --description "Security group for VocaloCart ALB" \
  --vpc-id vpc-0a00d5dd74ebc32b9 \
  --region ap-northeast-2 \
  --query "GroupId" \
  --output text)

# Allow HTTP traffic to ALB (port 80)
aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0 \
  --region ap-northeast-2

# Create ALB
aws elbv2 create-load-balancer \
  --name vocalocart-alb \
  --subnets $SUBNETS \
  --security-groups $ALB_SG \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4 \
  --region ap-northeast-2
```

**Save the Load Balancer ARN and DNS Name from output!**

Example output:
```json
{
  "LoadBalancers": [
    {
      "LoadBalancerArn": "arn:aws:elasticloadbalancing:ap-northeast-2:410766693536:loadbalancer/app/vocalocart-alb/xyz789",
      "DNSName": "vocalocart-alb-123456789.ap-northeast-2.elb.amazonaws.com",
      ...
    }
  ]
}
```

---

### Step 3: Create Listener

Listener tells ALB where to forward traffic.

```bash
# Replace with your ARNs
ALB_ARN="arn:aws:elasticloadbalancing:ap-northeast-2:410766693536:loadbalancer/app/vocalocart-alb/xyz789"
TG_ARN="arn:aws:elasticloadbalancing:ap-northeast-2:410766693536:targetgroup/vocalocart-backend-tg/abc123"

# Create listener on port 80
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN \
  --region ap-northeast-2
```

---

### Step 4: Update ECS Security Group

Allow ALB to access ECS containers.

```bash
# Get ECS security group ID
ECS_SG="sg-084bf69e0f723f92f"

# Allow ALB to access ECS on port 8081
aws ec2 authorize-security-group-ingress \
  --group-id $ECS_SG \
  --protocol tcp \
  --port 8081 \
  --source-group $ALB_SG \
  --region ap-northeast-2
```

---

### Step 5: Update ECS Service

Connect ECS service to ALB.

```bash
# Get target group ARN (from Step 1)
TG_ARN="arn:aws:elasticloadbalancing:ap-northeast-2:410766693536:targetgroup/vocalocart-backend-tg/abc123"

# Update service
aws ecs update-service \
  --cluster vocalocart-cluster \
  --service vocalocart-backend-service \
  --load-balancers "targetGroupArn=$TG_ARN,containerName=vocalocart-backend,containerPort=8081" \
  --region ap-northeast-2
```

⚠️ **Note:** This might require recreating the service. If it fails, delete and recreate:

```bash
# Delete old service
aws ecs update-service \
  --cluster vocalocart-cluster \
  --service vocalocart-backend-service \
  --desired-count 0 \
  --region ap-northeast-2

aws ecs delete-service \
  --cluster vocalocart-cluster \
  --service vocalocart-backend-service \
  --region ap-northeast-2

# Create new service with ALB
aws ecs create-service \
  --cluster vocalocart-cluster \
  --service-name vocalocart-backend-service \
  --task-definition vocalocart-backend:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[sg-084bf69e0f723f92f],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$TG_ARN,containerName=vocalocart-backend,containerPort=8081" \
  --health-check-grace-period-seconds 60 \
  --region ap-northeast-2
```

---

### Step 6: Test ALB

Wait 2-3 minutes for health checks, then test:

```bash
# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names vocalocart-alb \
  --region ap-northeast-2 \
  --query "LoadBalancers[0].DNSName" \
  --output text)

echo "ALB DNS: $ALB_DNS"

# Test API (note: port 80, not 8081)
curl http://$ALB_DNS/api/products
```

**Expected:** JSON response with products

---

### Step 7: Update Frontend

Update `.env` with static ALB URL:

```bash
# .env
VITE_API_URL=http://vocalocart-alb-123456789.ap-northeast-2.elb.amazonaws.com/api
```

🎉 **Done! No more IP changes!**

---

## Solution 2: Elastic IP (NOT Recommended for Fargate)

### Why Not?
- ❌ Elastic IPs work with EC2, not Fargate
- ❌ Fargate uses ENI (Elastic Network Interface) which changes
- ❌ Can't directly attach EIP to Fargate task
- ❌ Would need complex NAT Gateway setup

### If You Really Want Static IP Without ALB

Use ECS on EC2 instead of Fargate:
1. Launch EC2 instance (t3.micro)
2. Assign Elastic IP
3. Run ECS agent on EC2
4. Deploy container to EC2

**Not recommended** - defeats purpose of serverless Fargate.

---

## Solution 3: Use Free Tier (Current - Accept IP Changes)

### Quick IP Check Script

Create `get-backend-ip.sh`:

```bash
#!/bin/bash
TASK_ARN=$(aws ecs list-tasks \
  --cluster vocalocart-cluster \
  --service-name vocalocart-backend-service \
  --region ap-northeast-2 \
  --desired-status RUNNING \
  --query "taskArns[0]" \
  --output text)

ENI=$(aws ecs describe-tasks \
  --cluster vocalocart-cluster \
  --tasks $TASK_ARN \
  --region ap-northeast-2 \
  --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value|[0]" \
  --output text)

PUBLIC_IP=$(aws ec2 describe-network-interfaces \
  --network-interface-ids $ENI \
  --region ap-northeast-2 \
  --query "NetworkInterfaces[0].Association.PublicIp" \
  --output text)

echo "Current Backend IP: $PUBLIC_IP"
echo "Update your .env file:"
echo "VITE_API_URL=http://$PUBLIC_IP:8081/api"
```

**Usage:**
```bash
bash get-backend-ip.sh
# Copy the URL to .env
```

---

## Comparison: ALB vs No ALB

| Feature | With ALB | Without ALB (Current) |
|---------|----------|----------------------|
| **Cost** | ~$16-18/month | $0 (free tier) |
| **URL Stability** | Static DNS | IP changes on restart |
| **SSL/HTTPS** | Supported | Not supported |
| **Custom Domain** | Easy to add | Requires extra setup |
| **Production Ready** | ✅ Yes | ❌ No |
| **Development Use** | Overkill | ✅ Perfect |
| **Setup Complexity** | Medium | Low |
| **Maintenance** | Low | High (IP updates) |

---

## Recommendation by Use Case

### Development/Testing (Current Stage)
**Use:** No ALB (free tier)
- Cost: $0
- Accept IP changes
- Use `get-backend-ip.sh` when needed
- Update `.env` manually

### MVP/Demo (Showing to Friends)
**Use:** Application Load Balancer
- Cost: ~$16/month
- Stable URL to share
- Better user experience

### Production (Paying Customers)
**Use:** ALB + SSL + Custom Domain
- Cost: ~$25/month (ALB + domain + Route53)
- Professional setup
- HTTPS security
- Custom domain (api.vocalocart.com)

---

## Custom Domain Setup (Optional - After ALB)

### Prerequisites
- Application Load Balancer created ✅
- Domain registered (GoDaddy, Namecheap, etc.)

### Steps

1. **Get SSL Certificate (Free)**
```bash
# Request certificate from AWS ACM
aws acm request-certificate \
  --domain-name api.vocalocart.com \
  --validation-method DNS \
  --region ap-northeast-2
```

2. **Validate Domain**
- Add DNS records provided by ACM
- Wait for validation (~5-30 minutes)

3. **Add HTTPS Listener to ALB**
```bash
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN \
  --region ap-northeast-2
```

4. **Add DNS Record**
- Type: CNAME
- Name: api
- Value: vocalocart-alb-123456789.ap-northeast-2.elb.amazonaws.com

5. **Update Frontend**
```bash
VITE_API_URL=https://api.vocalocart.com/api
```

---

## Monitoring IP Changes

### CloudWatch Alarm for Task Restart

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name vocalocart-task-restart \
  --alarm-description "Alert when ECS task restarts" \
  --metric-name DesiredTaskCount \
  --namespace AWS/ECS \
  --statistic Average \
  --period 60 \
  --threshold 1 \
  --comparison-operator LessThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=ServiceName,Value=vocalocart-backend-service Name=ClusterName,Value=vocalocart-cluster \
  --region ap-northeast-2
```

Sends notification when task count drops (indicates restart).

---

## Summary

### For Now (Free Tier - No ALB)
1. Use `get-backend-ip.sh` script when IP changes
2. Update `.env` manually
3. Restart frontend dev server
4. Cost: $0

### When Ready for Production (ALB)
1. Follow steps above to create ALB
2. One-time setup ~30 minutes
3. Static DNS forever
4. Cost: ~$16/month

### Best Practice
Start without ALB (save money), add ALB when:
- Showing demo to others
- MVP ready for testing
- Need stable URL
- Ready to spend $16/month

---

**Current Status:** Using free tier without ALB ✅  
**Next Step:** Add ALB when moving to production
