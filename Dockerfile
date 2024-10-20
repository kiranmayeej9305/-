# Stage 1: Build the application
FROM oven/bun:1 AS builder

# Set the working directory
WORKDIR /app

# Copy only the necessary files for installation
COPY package.json bun.lockb* ./

# Install dependencies with Bun
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN bun run build

# Remove development dependencies (optional but useful for larger apps)
RUN rm -rf node_modules && bun install --production

# Stage 2: Production
FROM oven/bun:1-slim AS runner

# Set the working directory
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy the necessary files from the build stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set memory limits (adjust as needed based on performance testing)
ENV BUN_JS_HEAP_SIZE_MB=2048

# Expose the port the app will run on
EXPOSE 3000

# Start the application in production mode
CMD ["bun", "start"]
