# Stage 1: Build the application
FROM oven/bun:1 AS builder

# Set the working directory
WORKDIR /app

# Install only necessary build tools
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and lockfile
COPY package.json bun.lockb* ./

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Build the Next.js application with increased memory limit
RUN NODE_OPTIONS="--max-old-space-size=4096" bun run build

# Stage 2: Production
FROM oven/bun:1-slim AS runner

# Set the working directory
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy necessary files from the build stage
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Set memory limits for runtime
ENV BUN_JS_HEAP_SIZE_MB=4096

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["bun", "start"]
