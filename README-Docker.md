# Choco Developer Bot - Docker Deployment

## 🐳 Docker Setup

This guide will help you deploy the Choco Developer Bot using Docker and Docker Compose.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Discord Bot Token
- MongoDB connection string (or use the included MongoDB)

## 🚀 Quick Start

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd Choco-Developer-Bot
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file with your credentials:**
   ```env
   DISCORD_TOKEN=your_discord_bot_token_here
   MONGODB_URI=mongodb://admin:password123@mongodb:27017/choco-bot?authSource=admin
   PORT=8080
   NODE_ENV=production
   ```

4. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

## 📁 Docker Files Created

- **`Dockerfile`**: Main container configuration
- **`docker-compose.yml`**: Multi-container setup with MongoDB
- **`.dockerignore`**: Files to exclude from Docker build
- **`mongo-init.js`**: MongoDB initialization script
- **`README-Docker.md`**: This documentation

## 🔧 Services

### Choco Bot Service
- **Image**: Built from `Dockerfile`
- **Port**: 8080 (host) → 8080 (container)
- **Restart**: Unless stopped
- **Health Check**: Every 30 seconds

### MongoDB Service
- **Image**: mongo:7.0
- **Port**: 27017 (host) → 27017 (container)
- **Volume**: `mongodb_data` for persistence
- **Credentials**: admin/password123 (change in production)

## 🛠️ Docker Commands

### Build and Start
```bash
docker-compose up -d --build
```

### View Logs
```bash
docker-compose logs -f choco-bot
docker-compose logs -f mongodb
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes
```bash
docker-compose down -v
```

### Restart Services
```bash
docker-compose restart
```

## 🔍 Monitoring

### Check Container Status
```bash
docker-compose ps
```

### Health Check
```bash
curl http://localhost:8080
```

### Access MongoDB
```bash
docker exec -it choco-mongodb mongosh -u admin -p password123 --authenticationDatabase admin
```

## 🌐 Production Considerations

1. **Change Default Passwords**: Update MongoDB credentials in `docker-compose.yml`
2. **Environment Variables**: Use secure secrets management
3. **Network Security**: Consider using private networks
4. **Backup Strategy**: Implement MongoDB backup procedures
5. **Resource Limits**: Add resource constraints to docker-compose.yml

## 🐛 Troubleshooting

### Bot Won't Start
1. Check Discord token in `.env`
2. Verify MongoDB connection
3. Check logs: `docker-compose logs choco-bot`

### MongoDB Connection Issues
1. Ensure MongoDB is running: `docker-compose ps`
2. Check connection string format
3. Verify network connectivity

### Port Conflicts
1. Change host ports in `docker-compose.yml`
2. Check for other services using ports 8080/27017

## 📊 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Discord bot token | ✅ |
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `PORT` | Application port | ✅ |
| `NODE_ENV` | Environment mode | ✅ |

## 🔗 Useful Links

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Discord.js Documentation](https://discord.js.org/)
