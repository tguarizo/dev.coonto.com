FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache ffmpeg
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/content ./content
COPY --from=builder --chown=nextjs:nodejs /app/scripts/generate-work-audio.mjs ./scripts/generate-work-audio.mjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/generate-home-example-audio.mjs ./scripts/generate-home-example-audio.mjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/generate-beta-audio.mjs ./scripts/generate-beta-audio.mjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/prepare-beta-video.mjs ./scripts/prepare-beta-video.mjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/qa ./scripts/qa
COPY --from=builder --chown=nextjs:nodejs /app/scripts/rc-audio.cjs ./scripts/rc-audio.cjs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/publish-martha-dev.mjs ./scripts/publish-martha-dev.mjs
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
