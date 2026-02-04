# 🚀 Sailors Dating App - Deployment Guide

## Quick Deployment Options

### Option 1: Local Docker (Development/Testing)

Perfect for testing locally before deployment.

```bash
# Clone the repository
git clone https://github.com/orionclawdvmbot/sailors-dating-app.git
cd sailors-dating-app

# Setup environment
cp .env.example .env

# Start all services
docker-compose up -d

# Access the app
# Frontend: http://localhost:3000
# API: http://localhost:5000
# Health: http://localhost:5000/api/health
```

### Option 2: AWS EC2 Deployment

```bash
# 1. Launch EC2 instance (Ubuntu 22.04 LTS)
# SSH into instance

# 2. Install Docker and Docker Compose
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git

# 3. Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# 4. Clone repository
git clone https://github.com/orionclawdvmbot/sailors-dating-app.git
cd sailors-dating-app

# 5. Create production .env
cp .env.example .env
# Edit .env with strong secrets:
# JWT_SECRET=<generate-strong-random-key>
# DB_PASSWORD=<strong-password>
# NODE_ENV=production

# 6. Start application
docker-compose up -d

# 7. Setup Nginx reverse proxy (optional)
# See Nginx section below
```

### Option 3: Heroku Deployment

```bash
# 1. Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Login to Heroku
heroku login

# 3. Create Heroku app
heroku create sailors-dating-app-prod

# 4. Set environment variables
heroku config:set JWT_SECRET=<strong-secret> \
  DB_PASSWORD=<strong-password> \
  NODE_ENV=production

# 5. Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# 6. Deploy
git push heroku main

# 7. Initialize database
heroku run npm run db:init --app sailors-dating-app-prod
```

### Option 4: DigitalOcean App Platform

```bash
# 1. Create DigitalOcean account
# 2. Create Docker registry (optional)
# 3. In App Platform:
#    - Connect GitHub repository
#    - Select "Dockerfile" as build source
#    - Add environment variables:
#      JWT_SECRET, DB_PASSWORD, NODE_ENV
# 4. Deploy!
```

### Option 5: Railway.app (Simplest)

```bash
# 1. Go to https://railway.app
# 2. Create new project
# 3. Connect GitHub repository
# 4. Railway auto-detects docker-compose.yml
# 5. Set environment variables in dashboard
# 6. Deploy with one click!
```

## Production Considerations

### 1. Environment Variables
**CRITICAL**: Change these in production:

```env
JWT_SECRET=generate-with: openssl rand -hex 32
DB_PASSWORD=use-strong-password
NODE_ENV=production
```

### 2. Database Backups

```bash
# Automated daily backups with AWS RDS
# Or schedule PostgreSQL backups:

# Docker container backup
docker-compose exec db pg_dump -U sailors_user sailors_dating > backup.sql

# Restore from backup
docker-compose exec -T db psql -U sailors_user sailors_dating < backup.sql
```

### 3. SSL/TLS Certificate (Required for HTTPS)

**Using Let's Encrypt with Nginx:**

```bash
sudo apt-get install -y certbot python3-certbot-nginx

# For yourdomain.com
sudo certbot certonly --standalone -d yourdomain.com

# Update Nginx config with certificate paths
```

### 4. Nginx Reverse Proxy Setup

Create `/etc/nginx/sites-available/sailors-dating-app`:

```nginx
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # API proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and test:

```bash
sudo ln -s /etc/nginx/sites-available/sailors-dating-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Monitoring & Logging

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Real-time monitoring
docker stats

# Persistent logging with ELK Stack
# Consider: Datadog, New Relic, or CloudWatch
```

### 6. Image Uploads - S3 Storage (Production)

For production, migrate from local storage to AWS S3:

```bash
# Install AWS SDK
npm install aws-sdk

# Update profile.js route to use S3
# Environment variables:
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=sailors-dating-photos
AWS_REGION=us-east-1
```

### 7. Database Scaling

**Current Setup**: PostgreSQL single instance

For millions of users:
- Enable read replicas
- Implement connection pooling (PgBouncer)
- Archive old messages
- Add Redis caching layer

### 8. Auto-Scaling Setup (AWS/GCP)

```bash
# Using AWS ECS with Docker Compose
ecs-cli up --cluster-config sailors-prod
ecs-cli compose -f docker-compose.yml service up --scaling-min 2 --scaling-max 10
```

## Security Checklist

- [ ] Change JWT_SECRET
- [ ] Use strong DB_PASSWORD
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Enable CloudFlare DDoS protection
- [ ] Implement rate limiting
- [ ] Add CORS whitelist
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable database encryption at rest
- [ ] Set up monitoring/alerting
- [ ] Regular security updates

## Performance Optimization

### Frontend
- Enable gzip compression
- Optimize images
- Use CDN for static files
- Lazy load components
- Code splitting

### Backend
- Implement caching (Redis)
- Use connection pooling
- Optimize database queries
- Implement pagination
- Add indexes to frequently queried fields

### Database
```sql
-- Add indexes
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_swipes_user ON swipes(user_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

## Troubleshooting Deployment

### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Errors
```bash
# Test PostgreSQL connection
psql -h db -U sailors_user -d sailors_dating

# Check connection string in logs
docker-compose logs db | grep "accepting"
```

### Out of Memory
```bash
# Increase Docker limits
# Edit docker-compose.yml

services:
  backend:
    mem_limit: 512m
    memswap_limit: 512m
```

### Frontend Not Connecting to API
```bash
# Verify API_URL
echo $REACT_APP_API_URL

# Check CORS configuration
# Update backend index.js if needed
```

## Maintenance

### Regular Tasks

1. **Daily**: Monitor logs and system health
2. **Weekly**: Review database size and performance
3. **Monthly**: Security updates, backup verification
4. **Quarterly**: Scale planning, cost analysis

### Update Dependencies

```bash
# Backend
cd backend
npm outdated
npm update

# Frontend
cd frontend
npm outdated
npm update
```

## Cost Estimation (AWS/DigitalOcean)

| Component | DigitalOcean | AWS |
|-----------|------------|-----|
| Compute (2 vCPU) | $12/mo | $30/mo |
| Database | $15/mo | $50/mo |
| Storage (50GB) | $5/mo | $10/mo |
| CDN | $0-10/mo | Variable |
| **Total** | **~$35/mo** | **~$100+/mo** |

---

**Questions?** Check README.md or open an issue on GitHub.

Happy sailing! ⛵
