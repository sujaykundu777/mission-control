# Docker Setup for Domain Manager OS

This guide explains how to containerize and run the Domain Manager OS application, which is structured as a monorepo with the Next.js app in the `/client` folder.

## Project Structure

```
/
├── client/                    # Next.js application
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── pnpm-lock.yaml
├── Dockerfile                 # Monorepo-aware Dockerfile
├── docker-compose.yml         # Production configuration
├── docker-compose.dev.yml     # Development configuration
└── .dockerignore
```

## Prerequisites

- Docker (v20.10+)
- Docker Compose (v1.29+)

## Building the Docker Image

### Production Build

Build the optimized production image:

```bash
docker-compose build
```

This creates a multi-stage build:
1. **Builder stage**: Installs dependencies and builds the Next.js application
2. **Runtime stage**: Copies only necessary files and production dependencies (minimal image size)

### Building Specific Stages

Build only the builder stage for debugging:

```bash
docker build --target builder -t domain-manager-os:builder .
```

## Running the Application

### Production Mode

Start the application in production mode:

```bash
docker-compose up
```

Or start in detached mode (background):

```bash
docker-compose up -d
```

The application will be available at: **http://localhost:3000**

### Development Mode

For hot-reload development with live code changes:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This enables:
- Live file watching and hot reload
- Full source code mounted
- Development dependencies
- Access to development tools

### Development Commands

```bash
# Start in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Run in background
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Stop containers
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
```

## Environment Variables

Create a `.env` file in the root directory if needed:

```bash
NODE_ENV=production
```

For development, create a `.env.local`:

```bash
NODE_ENV=development
```

## Data Persistence

The application uses browser localStorage for data persistence, so data persists across:
- Container restarts
- Page reloads
- Browser sessions

No external database setup is required.

## Container Management

### View Running Containers

```bash
docker-compose ps
```

### View Container Logs

```bash
docker-compose logs -f web
```

### Stop Containers

```bash
docker-compose stop
```

### Remove Containers and Volumes

```bash
docker-compose down

# Also remove volumes (warning: deletes Docker volumes)
docker-compose down -v
```

### Restart Containers

```bash
docker-compose restart
```

## Port Configuration

The application runs on port `3000` inside the container and is exposed on your host machine as port `3000`.

To use a different port:

```bash
docker-compose -e "PORT=8080" up
```

Or modify the `ports` section in `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Host port 8080 mapped to container port 3000
```

## Health Checks

The Docker setup includes a health check that:
- Runs every 30 seconds
- Has a 3-second timeout
- Requires 3 consecutive failures to mark unhealthy
- Has a 40-second startup grace period

Check health status:

```bash
docker-compose ps
```

Look for the STATUS column.

## Troubleshooting

### Container Won't Start

Check the logs:

```bash
docker-compose logs web
```

Common issues:
- Port 3000 already in use
- Missing dependencies in node_modules
- Incorrect file permissions

### Performance Issues

If slow startup or high memory usage:

1. Clear Docker cache:
   ```bash
   docker system prune -a
   ```

2. Rebuild without cache:
   ```bash
   docker-compose build --no-cache
   ```

3. Increase Docker memory limit in Docker Desktop settings

### Module Not Found Errors

Rebuild to ensure dependencies are installed:

```bash
docker-compose down
docker-compose up --build
```

## Multi-Node Deployment

For production with multiple replicas:

```yaml
services:
  web:
    # ... existing config ...
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## Kubernetes Support

To deploy to Kubernetes, you can use:

```bash
docker-compose config > docker-compose.expanded.yml
kompose convert -f docker-compose.expanded.yml -o k8s-manifests/
kubectl apply -f k8s-manifests/
```

## Security Best Practices

The Dockerfile includes:
- Non-root user (nodejs) for running the app
- Multi-stage build to minimize final image size
- No sensitive data in environment
- Health checks for monitoring

### Additional Security Measures

For production:

1. Use private Docker registries
2. Enable image scanning
3. Set resource limits
4. Use environment-specific secrets management
5. Enable Docker Content Trust

## Image Size Optimization

Production image size: ~300MB (depending on dependencies)

Factors affecting size:
- Node.js base image (Alpine ~150MB)
- Production dependencies (~100MB)
- Built Next.js application (~50MB)

To further reduce:
- Use `node:20-alpine` (already done)
- Prune unused dependencies
- Enable next.js output standalone mode (future optimization)

## FAQ

**Q: Can I use this with Docker Swarm?**
A: Yes, remove the `build` section and push to a registry first, then use `image:` instead.

**Q: How do I access the container shell?**
A: Run `docker-compose exec web sh`

**Q: Can I mount volumes for persistent data?**
A: Yes, data is already persisted in browser localStorage. For server-side persistence, add a database service.

**Q: How do I backup data?**
A: Use the Settings page to export data as JSON, or implement a database backup strategy.

---

For more information about the application, see the main README.md
