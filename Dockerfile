# Stage 1: Build the application
FROM oven/bun:1 AS builder

# Set the working directory
WORKDIR /app

# Install necessary build tools and Python
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and lockfile
COPY package.json bun.lockb* ./

# Install dependencies with Bun
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Check for TypeScript errors, increase memory limit
RUN NODE_OPTIONS="--max-old-space-size=4096" bun run tsc --noEmit

# Build the Next.js application with verbose logging and increased memory limit
RUN NODE_OPTIONS="--max-old-space-size=4096" bun run build

# Remove development dependencies
RUN rm -rf node_modules && bun install --production

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

# Copy Prisma files (if needed for runtime)
COPY --from=builder /app/prisma ./prisma

# Set memory limits for runtime (adjust as needed)
ENV BUN_JS_HEAP_SIZE_MB=4096

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["bun", "start"]
