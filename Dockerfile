# ==============================================================================
# Votexa Multi-Stage Production Dockerfile
# Builds @votexa/shared, @votexa/server, and @votexa/client
# ==============================================================================

# Stage 1: Build Dependencies and Compilations
FROM node:20-alpine AS builder

WORKDIR /app

# Install build essentials for native packages if needed
RUN apk add --no-cache python3 make g++

# Copy root workspace configuration and lockfiles
COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json shared/tsconfig.json ./shared/
COPY server/package.json server/tsconfig.json ./server/
COPY client/package.json client/tsconfig.json client/tsconfig.node.json client/vite.config.ts ./client/

# Install all workspace dependencies
RUN npm ci

# Copy complete source code
COPY shared ./shared
COPY server ./server
COPY client ./client

# Build packages in topological order
RUN npm run build --workspace=shared
RUN npm run build --workspace=server
RUN npm run build --workspace=client

# Prune devDependencies for production runtime
RUN npm prune --omit=dev

# Stage 2: Production Server Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install curl for container health check
RUN apk add --no-cache curl

# Create non-root system user and group
RUN addgroup -S votexa && adduser -S votexa -G votexa

# Copy production node_modules from builder
COPY --from=builder --chown=votexa:votexa /app/node_modules ./node_modules
COPY --from=builder --chown=votexa:votexa /app/package.json ./package.json

# Copy compiled shared package
COPY --from=builder --chown=votexa:votexa /app/shared/package.json ./shared/package.json
COPY --from=builder --chown=votexa:votexa /app/shared/dist ./shared/dist

# Copy compiled server package and database migrations
COPY --from=builder --chown=votexa:votexa /app/server/package.json ./server/package.json
COPY --from=builder --chown=votexa:votexa /app/server/dist ./server/dist
COPY --from=builder --chown=votexa:votexa /app/server/src/database ./server/dist/database

# Copy compiled frontend client assets (can be served directly or via Nginx)
COPY --from=builder --chown=votexa:votexa /app/client/dist ./client/dist

# Switch to non-privileged user
USER votexa

EXPOSE 5000

# Container healthcheck against backend health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start production server
CMD ["node", "server/dist/index.js"]

