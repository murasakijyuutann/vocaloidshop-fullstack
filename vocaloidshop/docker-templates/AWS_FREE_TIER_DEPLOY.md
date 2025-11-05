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

## ⚠️ CRITICAL: Directory & Path Requirements

**Before starting, read this carefully to avoid common errors:**

### 📁 Where to Run Commands

**ALWAYS run EB commands from:**
```
/c/Users/YOUR_WINDOWS_USERNAME/Documents/VSCodeProjects/v_shop/vocaloidshop
```

**Replace `YOUR_WINDOWS_USERNAME` with YOUR actual Windows username!**

Example: If your username is `rwoo1`:
```bash
cd /c/Users/rwoo1/Documents/VSCodeProjects/v_shop/vocaloidshop
```

### ✅ Quick Check Before Every Command

```bash
# Run this BEFORE every eb command:
pwd
# MUST show: /c/Users/YOUR_USERNAME/.../vocaloidshop (ends with vocaloidshop!)

# Verify files exist:
ls -la | grep -E "(Dockerrun|Dockerfile)"
# MUST show both files!
```

**If you're in the wrong directory:**
- ❌ `/v_shop` → Files missing error
- ❌ `/v_shop/vocaloid_front` → Wrong project  
- ❌ `/v_shop/proxy-express` → Wrong project
- ✅ `/v_shop/vocaloidshop` → CORRECT!

---

## 🚀 Quick Deployment (5 Minutes)

### Step 0: Install AWS CLI (Prerequisites)

**⚠️ IMPORTANT: Install AWS CLI before proceeding!**

**Method 1: Using MSI Installer (Recommended for Windows)**

1. Download the installer:
   ```bash
   curl "https://awscli.amazonaws.com/AWSCLIV2.msi" -o "awscliv2.msi"
   ```

2. **Double-click `awscliv2.msi`** to run the installer
   - Click through the installation wizard
   - Use default settings
   - Click "Install" (may require admin password)

3. **Restart your terminal** (close and reopen VS Code terminal)

4. Verify installation:
   ```bash
   aws --version
   ```
   Expected output: `aws-cli/2.x.x Python/3.x.x Windows/10 exe/AMD64`

**Method 2: Using winget (Alternative)**

```bash
winget install -e --id Amazon.AWSCLI
```

Then restart terminal and verify: `aws --version`

**Method 3: Using Chocolatey (Alternative)**

```bash
choco install awscli
```

Then restart terminal and verify: `aws --version`

### Step 1: Configure AWS Credentials

**After AWS CLI is installed:**

#### A. Create AWS Access Keys (First Time Setup)

1. **Go to AWS Console:** https://console.aws.amazon.com
   - Log in with your AWS account (create one if you don't have it)

2. **Navigate to Security Credentials:**
   - Click your **account name** in the top-right corner
   - Select **"Security credentials"** from the dropdown

3. **Create Access Key:**
   - Scroll down to **"Access keys"** section
   - Click **"Create access key"**
   - Select **"Command Line Interface (CLI)"**
   - Check the checkbox: "I understand the above recommendation..."
   - Click **"Next"**
   - (Optional) Add a description tag: "My local development"
   - Click **"Create access key"**

4. **Save Your Keys (IMPORTANT!):**
   - You'll see:
     - **Access key ID:** `AKIAIOSFODNN7EXAMPLE` (example)
     - **Secret access key:** `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` (example)
   - ⚠️ **Copy both values immediately** - you can't see the secret again!
   - Click **"Download .csv file"** to save them securely
   - Click **"Done"**

#### B. Configure AWS CLI

Now run:

```bash
aws configure
```

When prompted, enter:
```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE          # Paste your Access Key ID
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG...  # Paste your Secret Access Key
Default region name [None]: ap-northeast-2              # Your RDS is in Seoul
Default output format [None]: json                      # Press Enter
```

**Verify it works:**
```bash
aws sts get-caller-identity
```

Expected output:
```json
{
    "UserId": "AIDAI...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-username"
}
```

✅ You're now authenticated!

### Step 2: Navigate to Your Project Directory

**⚠️ CRITICAL:** You MUST be in the `vocaloidshop` directory for all commands!

```bash
# Navigate to the backend project directory
cd /c/Users/YOUR_WINDOWS_USERNAME/Documents/VSCodeProjects/v_shop/vocaloidshop

# Verify you're in the correct location
pwd
# Expected output: /c/Users/YOUR_WINDOWS_USERNAME/.../vocaloidshop

# Verify required files exist
ls -la | grep -E "(Dockerfile|pom.xml|src)"
# You should see: Dockerfile, pom.xml, and src directory
```

**Replace `YOUR_WINDOWS_USERNAME` with your actual Windows username!**

For example, if your username is `rwoo1`:
```bash
cd /c/Users/rwoo1/Documents/VSCodeProjects/v_shop/vocaloidshop
```

### Step 3: Push Image to ECR (one-time setup)

**⚠️ Make sure you're in the vocaloidshop directory first!**

```bash
# Verify you're in the right place
pwd  # Should end with /vocaloidshop

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

### Step 4: Prepare for Deployment

#### A. Fix .gitignore (CRITICAL!)

**⚠️ IMPORTANT:** Your `.gitignore` is preventing Dockerfile from being uploaded!

```bash
# Check if Dockerfile is in .gitignore
grep "^Dockerfile$" .gitignore

# If it exists, comment it out
sed -i 's/^Dockerfile$/# Dockerfile  # Needed for EB deployment!/' .gitignore

# Or manually edit .gitignore and change:
#   Dockerfile
# to:
#   # Dockerfile  # Needed for EB deployment!
```

**Then STAGE the files for git (CRITICAL!):**
```bash
# Stage the deployment files
git add Dockerfile Dockerrun.aws.json

# Verify they're staged
git status
# You should see: "new file: Dockerfile" and "new file: Dockerrun.aws.json"
```

**Why?** EB uses git to create the deployment bundle. Files must be:
1. NOT in `.gitignore` AND
2. Either committed OR staged (added with `git add`)

If files are untracked and not staged, EB won't include them!

#### B. Remove Docker Compose Files (IMPORTANT!)

**⚠️ Critical:** Elastic Beanstalk will fail if both `docker-compose.yml` and `Dockerrun.aws.json` exist!

```bash
# Move docker-compose files to avoid conflicts
mkdir -p docker-templates/backup
mv docker-compose.yml docker-compose.prod.yml docker-templates/backup/ 2>/dev/null || true
```

**Why?** EB gets confused when both files exist and will try to use docker-compose instead of Dockerrun.aws.json.

#### C. Create or Update Dockerrun.aws.json

This file tells Elastic Beanstalk how to run your container:

```bash
# Create the file in vocaloidshop directory
cat > Dockerrun.aws.json << 'EOF'
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
EOF
```

**Replace `YOUR_ACCOUNT_ID`** with your actual account ID from Step 3.

Or use this command to do it automatically:
```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
cat > Dockerrun.aws.json << EOF
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "$AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest",
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
EOF
```

### Step 5: Initialize and Deploy

**⚠️ TRIPLE CHECK: Make sure you're in the vocaloidshop directory!**

```bash
# Verify directory (DO THIS FIRST!)
pwd
# MUST show: /c/Users/YOUR_USERNAME/.../vocaloidshop

# If you're in the wrong directory, navigate to vocaloidshop:
cd /c/Users/YOUR_WINDOWS_USERNAME/Documents/VSCodeProjects/v_shop/vocaloidshop

# Verify files exist
ls -la | grep -E "(Dockerrun.aws.json|Dockerfile)"
# You MUST see both files listed!
```

#### A. Initialize Elastic Beanstalk

```bash
# Initialize Elastic Beanstalk application
eb init -p docker -r ap-northeast-2 vocalocart-backend
```

**If you get an encoding error**, ignore it - it's a Windows-specific warning.

#### B. Create Environment

```bash
# Create environment with FREE TIER instance
# This takes 3-5 minutes
eb create vocalocart-prod \
  --instance-type t3.micro \
  --single
```

**Expected output:**
```
Creating application version archive...
Uploading: [##################################################] 100% Done...
Environment details for: vocalocart-prod
  ...
2025-11-05 08:05:21    INFO    createEnvironment is starting.
2025-11-05 08:06:18    INFO    Created security group
2025-11-05 08:06:34    INFO    Waiting for EC2 instances to launch...
...
2025-11-05 08:08:49    INFO    Successfully launched environment: vocalocart-prod
```

**⚠️ Common Issues:**

**Error: "Detected both docker-compose.yml and Dockerrun.aws.json"**
- **Solution:** Run Step 4A again to move docker-compose files

**Error: "invalid interpolation format for MYSQL_ROOT_PASSWORD"**
- **Cause:** docker-compose.yml has syntax error `${VAR:value}` instead of `${VAR:-value}`
- **Solution:** Remove docker-compose files (Step 4A)

**Error: "Instance deployment failed"**
- **Solution:** Check logs with `eb logs` and look for eb-engine.log

#### C. Set Environment Variables

After the environment is created successfully:

```bash
# Set environment variables (secrets)
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
```

#### D. Get Your Application URL

```bash
# Get the URL
eb status

# Or open directly in browser
eb open
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

## 🆘 Detailed Troubleshooting Guide

### Issue 1: "Detected both docker-compose.yml and Dockerrun.aws.json"

**Full Error Message:**
```
WARN    Detected both docker-compose.yml and Dockerrun.aws.json V1 file in your source bundle. 
        We only use Authentication Key within your Dockerrun.aws.json file.
ERROR   Instance deployment failed. For details, see 'eb-engine.log'.
```

**Root Cause:**
- Elastic Beanstalk found both configuration files and got confused
- It tried to use docker-compose instead of Dockerrun.aws.json
- This causes deployment to fail

**Solution:**
```bash
# 1. Move docker-compose files out of the way
mkdir -p docker-templates/backup
mv docker-compose.yml docker-compose.prod.yml docker-templates/backup/

# 2. Terminate failed environment
eb terminate vocalocart-prod --force

# 3. Re-initialize and deploy
eb init -p docker -r ap-northeast-2 vocalocart-backend
eb create vocalocart-prod --instance-type t3.micro --single
```

---

### Issue 2: "Invalid interpolation format for MYSQL_ROOT_PASSWORD"

**Full Error Message:**
```
ERROR   Command docker compose config failed with error exit status 1. 
Stderr: invalid interpolation format for services.mysql.environment.MYSQL_ROOT_PASSWORD.
You may need to escape any $ with another $.
${DB_PASSWORD:DoodyDanks48}
```

**Root Cause:**
- docker-compose.yml has incorrect syntax
- Should be `${VAR:-default}` (with hyphen) not `${VAR:default}`
- This is a docker-compose v2 syntax issue

**Solution:**
Same as Issue 1 - remove docker-compose files:
```bash
mkdir -p docker-templates/backup
mv docker-compose*.yml docker-templates/backup/
eb terminate vocalocart-prod --force
eb init -p docker -r ap-northeast-2 vocalocart-backend
eb create vocalocart-prod --instance-type t3.micro --single
```

---

### Issue 3: "Both 'Dockerfile' and 'Dockerrun.aws.json' are missing" (Even Though They Exist!)

**Full Error Message:**
```
ERROR   Instance deployment: Both 'Dockerfile' and 'Dockerrun.aws.json' are missing in your source bundle.
        Include at least one of them. The deployment failed.
```

**Root Causes:**

**Cause A: Wrong Directory**
- You're running `eb create` from the WRONG directory
- You're in `v_shop` directory, but need to be in `vocaloidshop` directory

**Cause B: Dockerfile in .gitignore (MOST COMMON!)**
- Your `.gitignore` file has `Dockerfile` listed
- EB uses git to create bundle, so Dockerfile is excluded
- Files exist locally but aren't uploaded to AWS

**Solution for Cause A (Wrong Directory):**
```bash
# 1. Check where you are
pwd
# If it shows /c/Users/.../v_shop, you're in the WRONG place!

# 2. Navigate to the CORRECT directory
cd vocaloidshop
# Or full path:
cd /c/Users/YOUR_WINDOWS_USERNAME/Documents/VSCodeProjects/v_shop/vocaloidshop

# 3. Verify files exist
ls -la | grep -E "(Dockerrun.aws.json|Dockerfile)"
# You MUST see both files!
```

**Solution for Cause B (.gitignore Problem):**
```bash
# 1. Check if Dockerfile is being ignored
grep "^Dockerfile$" .gitignore
# If you see output, it's being ignored!

# 2. Comment out Dockerfile in .gitignore
sed -i 's/^Dockerfile$/# Dockerfile  # Needed for EB!/' .gitignore

# Or manually edit .gitignore:
# Change this line:
#   Dockerfile
# To:
#   # Dockerfile  # Needed for EB deployment!

# 3. STAGE THE FILES WITH GIT (CRITICAL!)
git add Dockerfile Dockerrun.aws.json

# 4. Verify they're staged
git status
# You MUST see:
#   Changes to be committed:
#     new file: Dockerfile
#     new file: Dockerrun.aws.json

# 5. Terminate failed environment
eb terminate vocalocart-prod --force

# 6. Create environment again (with files now staged)
eb create vocalocart-prod --instance-type t3.micro --single
```

**Important:** EB uses git, so files must be either:
- Committed to git, OR
- Staged with `git add`

Simply removing from `.gitignore` is NOT enough - you must also `git add` them!

---

### Issue 4: "Both docker-compose.yml and Dockerrun.aws.json"

**Error Message:**
```
ERROR: This directory has not been set up with the EB CLI
You must first run "eb init".
```

**Root Cause:**
- You're in the wrong directory, or
- The `.elasticbeanstalk` folder was deleted

**Solution:**
```bash
# 1. Navigate to correct directory
cd /c/Users/rwoo1/Documents/VSCodeProjects/v_shop/vocaloidshop

# 2. Verify you're in the right place
pwd  # Should show vocaloidshop at the end
ls Dockerrun.aws.json  # Should exist

# 3. Re-initialize
eb init -p docker -r ap-northeast-2 vocalocart-backend
```

---

### Issue 4: "UnicodeDecodeError: 'cp932' codec can't decode"

**Full Error Message:**
```
ERROR: UnicodeDecodeError - 'cp932' codec can't decode byte 0xef in position 409
```

**Root Cause:**
- Windows encoding issue with special characters in files
- Usually caused by UTF-8 BOM or non-ASCII characters

**Solution:**
This is usually a warning that can be ignored. If deployment fails:
```bash
# Check for problematic files
find . -name "*.json" -o -name "*.yml" | xargs file

# Re-save Dockerrun.aws.json with UTF-8 encoding (no BOM)
# Or recreate it:
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
cat > Dockerrun.aws.json << EOF
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "$AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-2.amazonaws.com/vocalocart-backend:latest",
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
EOF
```

---

### Issue 5: Cannot Connect to RDS from EB

**Symptoms:**
- Application starts but can't connect to database
- Logs show "Communications link failure"

**Solution:**
```bash
# 1. Get EB security group
EB_SG=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=*vocalocart-prod*" \
  --query 'SecurityGroups[0].GroupId' \
  --output text \
  --region ap-northeast-2)

echo "EB Security Group: $EB_SG"

# 2. Get RDS security group from AWS Console
# Go to: RDS → mydb → Connectivity & security → VPC security groups
# Copy the sg-xxxxx ID

# 3. Allow EB to connect to RDS
aws ec2 authorize-security-group-ingress \
  --group-id YOUR_RDS_SECURITY_GROUP_ID \
  --protocol tcp \
  --port 3306 \
  --source-group $EB_SG \
  --region ap-northeast-2
```

---

### How to View Detailed Logs

When deployment fails:

```bash
# Get all logs
eb logs --all

# Logs are saved to:
# .elasticbeanstalk/logs/YYMMDD_HHMMSS/

# View the main error log
cat .elasticbeanstalk/logs/*/i-*/var/log/eb-engine.log

# Or search for errors
grep -i error .elasticbeanstalk/logs/*/i-*/var/log/*.log
```

---

### Clean Start: Complete Reset

If everything is broken and you want to start fresh:

```bash
# 1. Terminate environment
eb terminate vocalocart-prod --force

# 2. Delete EB configuration
rm -rf .elasticbeanstalk

# 3. Clean up docker-compose files
mkdir -p docker-templates/backup
mv docker-compose*.yml docker-templates/backup/ 2>/dev/null || true

# 4. Verify Dockerrun.aws.json exists
ls -la Dockerrun.aws.json

# 5. Start fresh
eb init -p docker -r ap-northeast-2 vocalocart-backend
eb create vocalocart-prod --instance-type t3.micro --single
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
