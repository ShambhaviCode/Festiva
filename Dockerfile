# FESTIVA container image. NOT built or run during development (no Docker in the
# build environment). Provided for the Kubernetes demonstration in docs/NUDGEBEE_DEMO.md.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 FESTIVA_DATA_DIR=/data
RUN addgroup -S festiva && adduser -S festiva -G festiva && mkdir /data && chown festiva:festiva /data
COPY --from=build --chown=festiva:festiva /app ./
USER festiva
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
