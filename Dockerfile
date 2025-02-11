ARG ALPINE_VERSION=3.19

FROM node:20-alpine${ALPINE_VERSION} AS builder
WORKDIR /build-stage
COPY package*.json ./
RUN npm ci
COPY . ./

RUN npx prisma generate
RUN npm run build
RUN npm prune --production

FROM alpine:${ALPINE_VERSION} AS production
WORKDIR /usr/src/app

# Add required binaries
RUN apk add --no-cache libstdc++ dumb-init \
    && addgroup -g 1000 node && adduser -u 1000 -G node -s /bin/sh -D node \
    && chown node:node ./
COPY --from=builder /usr/local/bin/node /usr/local/bin/
COPY --from=builder /usr/local/bin/docker-entrypoint.sh /usr/local/bin/

ENTRYPOINT ["docker-entrypoint.sh"]

USER node
COPY --from=builder /build-stage/node_modules ./node_modules
COPY --from=builder /build-stage/dist ./dist

# Run with dumb-init to not start node with PID=1, since Node.js was not designed to run as PID 1
EXPOSE 3000
CMD ["dumb-init", "node", "dist/src/main.js"]
