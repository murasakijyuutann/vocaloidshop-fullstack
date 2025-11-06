# AWS ECS Fargate Deployment Troubleshooting Guide

## Complete Journey: From Failures to Success

This document covers all the issues encountered and solved during the VocaloCart backend deployment to AWS ECS Fargate.

---

## Phase 1: Elastic Beanstalk Attempts (FAILED)

### Why We Started with Elastic Beanstalk
- Initially seemed simpler for Docker deployments
- Advertised as "just upload your code"
- Free tier eligible

### Attempt 1: Docker Compose Conflict
**Error:**
```
Detected both docker-compose.yml and Dockerrun.aws.json V1 file
```

**Root Cause:** Elastic Beanstalk gets confused when both files exist

**Solution Attempted:** Moved docker-compose files to backup folder
```bash
mkdir -p docker-templates/backup
mv docker-compose.yml docker-templates/backup/
mv docker-compose.prod.yml docker-templates/backup/
```

**Result:** Failed with new error ❌

---

### Attempt 2: Wrong Directory Issue
**Error:**
```
Both 'Dockerfile' and 'Dockerrun.aws.json' are missing in your source bundle
```

**Root Cause:** Running `eb create` from wrong directory (`v_shop` instead of `vocaloidshop`)

**Solution Attempted:** 
```bash
cd C:/Users/rwoo1/Documents/VSCodeProjects/v_shop/vocaloidshop
eb create vocalocart-prod --instance-type t3.micro --single
```

**Result:** Same error persisted ❌

---

### Attempt 3: .gitignore Blocking Files
**Error:** Same "missing files" error

**Root Cause:** `Dockerfile` was in `.gitignore`, and EB uses git to create deployment bundle

**Solution Attempted:** Commented out Dockerfile in `.gitignore`
```gitignore
# Line 13 - Changed from:
Dockerfile

# To:
# Dockerfile  # Needed for EB deployment!
```

**Result:** Still failed ❌

---

### Attempt 4: Git Staging Required
**Error:** Same "missing files" error despite previous fixes

**Root Cause:** Files must be staged with git, not just present and not ignored

**Solution Attempted:**
```bash
git add Dockerfile Dockerrun.aws.json
git status  # Verified files are staged
eb create vocalocart-prod --instance-type t3.micro --single
```

**Result:** Fourth consecutive failure ❌

---

### Decision Point: Switch Methods
**User Quote:** "we're running into same mistakes should we try different method?"

**Analysis:**
- EB's git-based bundling inherently problematic
- Requires files to be: NOT in .gitignore AND (committed OR staged)
- Directory confusion with monorepo structure
- Complex interaction between git, .gitignore, staging, and EB bundling

**Decision:** ✅ Abandon Elastic Beanstalk, switch to ECS Fargate

---

## Phase 2: ECS Fargate Deployment (SUCCESS)

### Why ECS Fargate is Better
- ✅ Direct Docker push (no git issues)
- ✅ No .gitignore conflicts
- ✅ No directory confusion
- ✅ More reliable and predictable
- ✅ Better for production
- ✅ Still free tier eligible

---

### Step 1: Build and Push Docker Image ✅

**Build Docker Image:**
```bash
cd C:/Users/rwoo1/Documents/VSCodeProjects/v_shop/vocaloidshop
mvn clean package -DskipTests
docker build -t vocaloidshop-backend:latest .
```

**Expected Output:**
```
Successfully built 86b278986c38
Successfully tagged vocaloidshop-backend:latest
```

**Push to ECR:**
```bash
# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo $AWS_ACCOUNT_ID  # 410766693536

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

**Result:** ✅ Image successfully pushed to ECR

---

### Step 2: Create ECS Cluster ✅

```bash
aws ecs create-cluster \
  --cluster-name vocalocart-cluster \
  --region ap-northeast-2
```

**Result:** ✅ Cluster created

---

### Step 3: IAM Role Issues (3 Failures)

#### Issue 3.1: Missing IAM Role
**Error:**
```
ECS was unable to assume the role 'arn:aws:iam::410766693536:role/ecsTaskExecutionRole'
```

**Root Cause:** ecsTaskExecutionRole didn't exist

**Solution:**
```bash
# Create trust policy
cat > ecs-task-execution-trust-policy.json <<EOF
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

# Create role
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://ecs-task-execution-trust-policy.json

# Attach AWS managed policy
aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

**Result:** Role created, but service still failed ❌

---

#### Issue 3.2: ECR Authorization Failed
**Error:**
```
unable to retrieve ecr registry auth: AccessDeniedException: 
User: arn:aws:sts::410766693536:assumed-role/ecsTaskExecutionRole/... 
is not authorized to perform: ecr:GetAuthorizationToken
```

**Root Cause:** Role missing ECR permissions

**Solution:**
```bash
# Create ECR access policy
cat > ecr-access-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
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
  ]
}
EOF

# Attach inline policy
aws iam put-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-name ECRAccessPolicy \
  --policy-document file://ecr-access-policy.json
```

**Result:** ECR access fixed, but service still stopped ❌

---

#### Issue 3.3: CloudWatch Logs Failed
**Error:**
```
ResourceInitializationError: failed to validate logger args: 
AccessDeniedException: User is not authorized to perform: logs:CreateLogGroup
```

**Root Cause:** Role missing CloudWatch Logs permissions

**Solution:**
```bash
# Create CloudWatch Logs policy
cat > cloudwatch-logs-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Attach inline policy
aws iam put-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-name CloudWatchLogsPolicy \
  --policy-document file://cloudwatch-logs-policy.json

# Force new deployment
aws ecs update-service \
  --cluster vocalocart-cluster \
  --service vocalocart-backend-service \
  --force-new-deployment \
  --region ap-northeast-2
```

**Result:** ✅ Container started successfully!

---

### Step 4: Database Connectivity Issue

**Problem:** Container running but couldn't connect to RDS

**Root Cause:** RDS security group didn't allow connections from ECS security group

**Solution:**
```bash
# Get RDS security group ID
RDS_SG=$(aws rds describe-db-instances \
  --region ap-northeast-2 \
  --query "DBInstances[?DBInstanceIdentifier=='mydb'].VpcSecurityGroups[0].VpcSecurityGroupId" \
  --output text)

# Get ECS security group ID (from service creation)
ECS_SG="sg-084bf69e0f723f92f"

# Allow ECS to access RDS on port 3306
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG \
  --protocol tcp \
  --port 3306 \
  --source-group $ECS_SG \
  --region ap-northeast-2
```

**Result:** ✅ Database connectivity working!

---

### Final Success ✅

**Working Configuration:**
- **Cluster:** vocalocart-cluster
- **Service:** vocalocart-backend-service
- **Task Definition:** vocalocart-backend:1
- **CPU:** 512 (0.5 vCPU)
- **Memory:** 1024 MB
- **Running Tasks:** 1
- **Status:** HEALTHY

**Test Result:**
```bash
curl http://52.78.236.250:8081/api/products
# Returns: [{"id":1,"name":"미쿠 셔츠","price":4200,...}]
```

---

## Summary of All Issues and Solutions

| # | Issue | Root Cause | Solution | Status |
|---|-------|------------|----------|--------|
| 1 | EB docker-compose conflict | Both files present | Move docker-compose files | Failed |
| 2 | EB missing files | Wrong directory | Change to correct directory | Failed |
| 3 | EB missing files | Dockerfile in .gitignore | Comment out in .gitignore | Failed |
| 4 | EB missing files | Files not staged | `git add` files | Failed |
| 5 | Switch to ECS Fargate | EB unreliable | Use direct Docker push | Success |
| 6 | IAM role missing | Role doesn't exist | Create ecsTaskExecutionRole | Fixed |
| 7 | ECR authorization failed | Missing ECR permissions | Add ECR access policy | Fixed |
| 8 | CloudWatch Logs failed | Missing logs permissions | Add CloudWatch policy | Fixed |
| 9 | Database connection failed | Security group rules | Allow ECS → RDS on 3306 | Fixed |

**Total Issues:** 9  
**Resolved:** 9  
**Final Status:** ✅ DEPLOYED AND WORKING

---

## Lessons Learned

1. **Elastic Beanstalk is problematic for Docker**
   - Git-based bundling causes many issues
   - .gitignore conflicts
   - Staging requirements unclear
   - Not recommended for Docker deployments

2. **ECS Fargate is better for containers**
   - Direct Docker push
   - More predictable
   - Better error messages
   - Industry standard

3. **IAM permissions must be complete**
   - Need ECR access (pull images)
   - Need CloudWatch Logs (logging)
   - AWS managed policy alone isn't enough

4. **Security groups are critical**
   - ECS → RDS communication requires explicit rules
   - Test connectivity after deployment

5. **Free tier is viable for development**
   - 20 GB-Hours compute per day sufficient
   - RDS included in free tier
   - CloudWatch Logs included

---

## Time Investment

- **Elastic Beanstalk attempts:** ~2 hours (wasted)
- **ECS Fargate setup:** ~1 hour
- **IAM troubleshooting:** ~30 minutes
- **Security group fixes:** ~15 minutes
- **Total:** ~3.75 hours

**Could have been:** 1 hour if we started with ECS Fargate

---

## Next Document

See `AWS_STATIC_IP_SETUP.md` for solving the changing IP address problem with Application Load Balancer.
