# Build stage
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy package.json and bun.lockb (if you're using lockfile)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy necessary files from build stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Increase memory limit (Bun uses different flags than Node.js)
ENV BUN_JS_HEAP_SIZE_MB=4096

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["bun", "start"]
