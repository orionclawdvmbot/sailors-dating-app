# ⛵ Sailors Dating App

A modern, Tinder-style dating app for sailors worldwide. Connect with fellow sailors, share your passion for the sea, and find your perfect sailing partner.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **User Profiles**: Complete profiles with photos, bio, sailing level, and boat type
- **Photo Uploads**: Upload and manage multiple profile photos
- **Swipe Left/Right**: Tinder-style discovery and matching
- **Smart Matching**: Automatic match detection when both users swipe right
- **Real-time Chat**: Message your matches instantly
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend**: React 18 with React Router
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL 15
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs
- **File Uploads**: Multer
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Docker & Docker Compose installed
- Or alternatively: Node.js 18+, PostgreSQL 15, npm/yarn

## 🚀 Quick Start (Docker)

### 1. Clone and Setup

```bash
git clone https://github.com/yourusername/sailors-dating-app.git
cd sailors-dating-app
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` if you want to customize:
- Database credentials
- JWT secret (IMPORTANT: Change in production!)
- API URLs

### 3. Start the Application

```bash
docker-compose up -d
```

The application will:
- Initialize PostgreSQL database
- Create tables automatically
- Start backend API on port 5000
- Start frontend on port 3000

### 4. Access the App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### 5. Stop the Application

```bash
docker-compose down
```

## 🏃 Manual Setup (Without Docker)

### Backend Setup

```bash
cd backend
npm install

# Create .env file (copy from ../env.example)
# Update DB_HOST to localhost

npm run db:init  # Initialize database
npm run dev      # Start development server
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
REACT_APP_API_URL=http://localhost:5000

npm start  # Start development server
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Profiles
- `GET /api/profile/:userId` - Get user profile
- `PUT /api/profile` - Update profile (authenticated)
- `POST /api/profile/upload-photo` - Upload photo (authenticated)
- `GET /api/profile/discover/available` - Get profiles to discover

### Swipes
- `POST /api/swipes` - Swipe left/right
- `GET /api/swipes/stats` - Get swipe statistics

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:matchId` - Get specific match

### Chat
- `POST /api/chat/:matchId/messages` - Send message
- `GET /api/chat/:matchId/messages` - Get messages for match

## 🗄️ Database Schema

### Users Table
- id (UUID)
- email (unique)
- password (hashed)
- username (unique)
- first_name, last_name
- bio
- age
- location
- sailing_level
- boat_type
- photos (array)
- created_at, updated_at

### Swipes Table
- id (UUID)
- user_id (reference to users)
- target_user_id (reference to users)
- direction (left/right)
- created_at
- Unique constraint: user_id + target_user_id

### Matches Table
- id (UUID)
- user_1_id (reference to users)
- user_2_id (reference to users)
- created_at
- Unique constraint: user_1_id + user_2_id

### Messages Table
- id (UUID)
- match_id (reference to matches)
- sender_id (reference to users)
- content
- created_at

## 🔐 Security Notes

1. **JWT Secret**: Change `JWT_SECRET` in `.env` for production
2. **Database Password**: Use strong passwords in production
3. **HTTPS**: Enable HTTPS in production deployment
4. **CORS**: Configure CORS properly for your domain
5. **Photo Storage**: Consider using cloud storage (AWS S3, etc.) for production
6. **Rate Limiting**: Add rate limiting to API endpoints in production

## 🚀 Production Deployment

### Environment Setup

Create `.env` for production with strong secrets:

```bash
JWT_SECRET=your-very-secure-random-secret-here
DB_PASSWORD=very-secure-password-here
NODE_ENV=production
```

### Docker Build for Production

```bash
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up -d
```

### Cloud Deployment Options

**AWS EC2/ECS:**
```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag sailors-dating-app:latest <account>.dkr.ecr.us-east-1.amazonaws.com/sailors-dating-app:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/sailors-dating-app:latest
```

**Heroku:**
```bash
heroku login
heroku create sailors-dating-app
git push heroku main
```

**DigitalOcean App Platform:**
- Connect GitHub repository
- Configure as Dockerfile-based app
- Set environment variables
- Deploy

## 🧪 Testing

### Manual Testing Flow

1. Register two accounts
2. Add photos and profile info to each account
3. One account swipes right on the other
4. Other account swipes right back → Match created
5. Navigate to Matches
6. Click "Send Message" to open chat
7. Exchange messages

## 📱 Mobile Responsiveness

The app is fully responsive and works great on:
- iOS Safari
- Android Chrome
- Desktop browsers
- Tablets

## 🐛 Troubleshooting

### Database won't connect
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs db
```

### Backend API errors
```bash
# Check backend logs
docker-compose logs backend

# Verify database initialization
docker-compose exec backend npm run db:init
```

### Frontend won't load
```bash
# Check frontend logs
docker-compose logs frontend

# Verify API_URL is correct
echo $REACT_APP_API_URL
```

## 📦 Project Structure

```
sailors-dating-app/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   ├── db/             # Database setup
│   │   └── index.js        # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

Need help? Open an issue on GitHub or contact the development team.

---

**Happy Sailing! ⛵💕**

Built with ❤️ for sailors worldwide.
