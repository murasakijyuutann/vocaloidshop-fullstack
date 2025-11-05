# 🆓 AWS Free Tier Deployment Guide

## 💰 Cost Breakdown

### What You'll Pay:
- **EC2 t3.micro:** FREE (750 hours/month for 12 months)
- **Elastic Beanstalk:** FREE (just a management layer)
- **Application Load Balancer:** FREE (750 hours/month for 12 months)
- **Data Transfer:** FREE (100 GB/month)
- **RDS:** $15-30/month (you're already paying this)

### Total New Cost: **$0/month for first year!**

After 12 months:
- **t3.micro EC2:** ~$7.50/month
- **Total:** ~$22-37/month (still cheaper than Azure)

---

## 🚀 Quick Deployment (5 Minutes)

### Step 1: Install AWS EB CLI

```bash
# Install Python pip (if not installed)
pip install awsebcli --upgrade --user

# Verify installation
eb --version
```

### Step 2: Configure AWS Credentials

```bash
# Configure AWS (you'll need Access Key from AWS Console)
aws configure
# AWS Access Key ID: [Your Key]
# AWS Secret Access Key: [Your Secret]
# Default region: ap-northeast-2
# Default output format: json
```

**Get Access Keys:**
1. Go to AWS Console: https://console.aws.amazon.com
2. Click your name (top right) → Security credentials
3. Create access key → CLI → Create

### Step 3: Push Image to ECR (one-time setup)

```bash
cd /c/Users/rwoo1/Documents/VSCodeProjects/v_shop/vocaloidshop

# Get your AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Your AWS Account ID: $AWS_ACCOUNT_ID"

# Create ECR repository
aws ecr create-repository \
  --repository-name vocalocart-backend \
  --region ap-northeast-2

# Login to ECR
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com

# Tag and push your Docker image
docker tag vocaloidshop-backend:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest

docker push $AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest
```

### Step 4: Create Dockerrun.aws.json

This file tells Elastic Beanstalk how to run your container:

```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "YOUR_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": 8081,
      "HostPort": 80
    }
  ],
  "Logging": "/var/log/nginx"
}
```

**Replace `YOUR_ACCOUNT_ID`** with the account ID from Step 3.

### Step 5: Initialize and Deploy

```bash
# Initialize Elastic Beanstalk
eb init -p docker -r ap-northeast-2 vocalocart-backend

# Create environment with FREE TIER instance
eb create vocalocart-prod \
  --instance-type t3.micro \
  --single

# Set environment variables
eb setenv \
  DB_URL="jdbc:mysql://mydb.czwaweqgeexp.ap-northeast-2.rds.amazonaws.com:3306/vocalocart?serverTimezone=Asia/Seoul&characterEncoding=UTF-8" \
  DB_USERNAME="root" \
  DB_PASSWORD="DoodyDanks48" \
  MAIL_HOST="smtp.sendgrid.net" \
  MAIL_PORT="587" \
  MAIL_USERNAME="apikey" \
  MAIL_PASSWORD="YOUR_SENDGRID_KEY" \
  SERVER_PORT="8081" \
  JPA_DDL_AUTO="update"

# Get the URL
eb status
```

### Step 6: Update RDS Security Group

Your RDS needs to allow connections from Elastic Beanstalk:

```bash
# Get the Elastic Beanstalk security group ID
EB_SG=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=*vocalocart-prod*" \
  --query 'SecurityGroups[0].GroupId' \
  --output text \
  --region ap-northeast-2)

echo "EB Security Group: $EB_SG"

# Get your RDS security group ID (usually sg-xxxx)
# You can find this in RDS Console → mydb → Connectivity & security

# Allow EB to connect to RDS
aws ec2 authorize-security-group-ingress \
  --group-id YOUR_RDS_SECURITY_GROUP_ID \
  --protocol tcp \
  --port 3306 \
  --source-group $EB_SG \
  --region ap-northeast-2
```

### Step 7: Test Your Deployment

```bash
# Get your application URL
eb status | grep "CNAME"

# Test endpoints
curl http://YOUR-APP-URL.ap-northeast-2.elasticbeanstalk.com/actuator/health
curl http://YOUR-APP-URL.ap-northeast-2.elasticbeanstalk.com/swagger-ui.html

# Open in browser
eb open
```

---

## 🔄 Future Updates

### Update Your Application:

```bash
# 1. Rebuild Docker image locally
docker build -t vocaloidshop-backend:latest .

# 2. Push to ECR
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
docker tag vocaloidshop-backend:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest

# 3. Deploy to Elastic Beanstalk
eb deploy

# 4. Monitor deployment
eb logs -f
```

---

## 📊 Monitoring

```bash
# View logs in real-time
eb logs -f

# Check application health
eb health

# View detailed status
eb status

# SSH into instance (if needed)
eb ssh
```

---

## 🔒 Security Best Practices

### 1. Use Environment Properties Instead of Command Line

In AWS Console → Elastic Beanstalk → Configuration → Software:
- Add environment properties there instead of `eb setenv`
- More secure, can use encryption

### 2. Enable HTTPS (Optional, not free)

```bash
# Request SSL certificate in AWS Certificate Manager (ACM)
# Then update load balancer to use HTTPS
eb config
# Edit the configuration to add HTTPS listener
```

### 3. Restrict RDS Access

Update RDS security group to ONLY allow traffic from EB security group (already done in Step 6).

---

## 💡 Azure Alternative (Using AWS RDS)

If you still prefer Azure, here's how to connect to your AWS RDS:

### Azure Container Instances with AWS RDS:

```bash
# 1. Push to Docker Hub (simpler than ACR)
docker login
docker tag vocaloidshop-backend:latest YOUR_DOCKERHUB_USERNAME/vocalocart-backend:latest
docker push YOUR_DOCKERHUB_USERNAME/vocalocart-backend:latest

# 2. Deploy to Azure
az container create \
  --resource-group myResourceGroup \
  --name vocalocart-backend \
  --image YOUR_DOCKERHUB_USERNAME/vocalocart-backend:latest \
  --dns-name-label vocalocart \
  --ports 8081 \
  --cpu 1 \
  --memory 2 \
  --environment-variables \
    DB_URL="jdbc:mysql://mydb.czwaweqgeexp.ap-northeast-2.rds.amazonaws.com:3306/vocalocart?serverTimezone=Asia/Seoul&characterEncoding=UTF-8" \
    DB_USERNAME="root" \
    DB_PASSWORD="DoodyDanks48" \
    MAIL_HOST="smtp.sendgrid.net" \
    MAIL_PORT="587" \
    MAIL_USERNAME="apikey" \
    MAIL_PASSWORD="YOUR_SENDGRID_KEY" \
    SERVER_PORT="8081" \
    JPA_DDL_AUTO="update"

# 3. Update AWS RDS security group to allow Azure IP
# Get Azure container IP first, then add to RDS security group
```

### Important for Azure + AWS RDS:

1. **RDS must be publicly accessible** (check in RDS Console)
2. **RDS security group** must allow inbound from 0.0.0.0/0:3306 (or specific Azure IPs)
3. **SSL recommended** for cross-cloud communication
4. **Higher latency** (~50-100ms vs <10ms same region)
5. **Data transfer costs** (~$0.09/GB out of AWS)

---

## 📈 Scaling (When You Outgrow Free Tier)

### Vertical Scaling (Bigger Instance):
```bash
eb scale 1 --instance-type t3.small
```

### Horizontal Scaling (More Instances):
```bash
eb scale 3  # Run 3 instances
eb config   # Configure auto-scaling rules
```

---

## ❓ FAQ

### Q: What happens after 12 months?
**A:** You start paying for t3.micro (~$7.50/month). Still cheaper than most alternatives.

### Q: Can I use this for production?
**A:** Yes! t3.micro handles ~1000-2000 requests/min. Upgrade to t3.small for more traffic.

### Q: Will my RDS work with EB?
**A:** Yes! Just update RDS security group to allow EB's security group (Step 6).

### Q: Can I use custom domain?
**A:** Yes! Use Route 53 (AWS's DNS) to point your domain to EB URL.

### Q: What if I exceed 750 hours?
**A:** 750 hours = 31 days × 24 hours. One t3.micro instance 24/7 = exactly 750 hours. You're safe!

---

## 🎯 Quick Decision Matrix

| Factor | AWS Free Tier | Azure ACI |
|--------|--------------|-----------|
| **First Year Cost** | $0 | ~$384/year |
| **After 12 Months** | ~$90/year | ~$384/year |
| **Same Region as RDS** | ✅ Yes | ❌ No |
| **Setup Complexity** | Easy | Medium |
| **Latency to RDS** | <10ms | 50-100ms |
| **Cross-cloud Fees** | None | $5-10/month |

**Recommendation:** Start with AWS Free Tier. You can always migrate to Azure later!

---

## 🚀 One-Command Deploy Script

Save as `deploy-free-tier.sh`:

```bash
#!/bin/bash

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URL="$AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com"
REPO_NAME="vocalocart-backend"

echo "🚀 Deploying to AWS Free Tier..."

# Build Docker image
echo "📦 Building Docker image..."
docker build -t vocaloidshop-backend:latest .

# Create ECR repo (if doesn't exist)
echo "📦 Setting up ECR..."
aws ecr create-repository --repository-name $REPO_NAME --region ap-northeast-2 2>/dev/null || true

# Login to ECR
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin $ECR_URL

# Tag and push
echo "⬆️  Pushing to ECR..."
docker tag vocaloidshop-backend:latest $ECR_URL/$REPO_NAME:latest
docker push $ECR_URL/$REPO_NAME:latest

# Deploy to EB
echo "🌐 Deploying to Elastic Beanstalk..."
eb deploy

echo "✅ Deployment complete!"
echo "🔍 Check status: eb status"
echo "🌍 Open app: eb open"
```

Make executable: `chmod +x deploy-free-tier.sh`

Run: `./deploy-free-tier.sh`

---

**Next Step:** Run the commands in Step 1-7 above to deploy for FREE! 🎉
