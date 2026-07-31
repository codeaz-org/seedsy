# Seedsy — self-hosted image.
# NEXT_PUBLIC_* vars are inlined into the client bundle AT BUILD TIME, so they
# arrive as build args (docker-compose passes them from .env). Server-side
# secrets (service role key, OpenRouter, CRON_SECRET) are runtime env only and
# must NOT be baked into the image.

# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_DEPLOYMENT_MODE=self_hosted
ARG NEXT_PUBLIC_CLOUD_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_DEPLOYMENT_MODE=$NEXT_PUBLIC_DEPLOYMENT_MODE \
    NEXT_PUBLIC_CLOUD_URL=$NEXT_PUBLIC_CLOUD_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S seedsy && adduser -S seedsy -G seedsy
COPY --from=build --chown=seedsy:seedsy /app/.next/standalone ./
COPY --from=build --chown=seedsy:seedsy /app/.next/static ./.next/static
USER seedsy
EXPOSE 3000
CMD ["node", "server.js"]
