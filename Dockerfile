FROM --platform=$BUILDPLATFORM node:24.18-alpine AS build
WORKDIR /app
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY ./angular.json .
COPY ./ngsw-config.json .
COPY tsconfig.json .
COPY tsconfig.app.json .
COPY src ./src

RUN pnpm build:prod

FROM nginx:alpine
ARG APP
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/block-game/3rdpartylicenses.txt /usr/share/nginx/html
COPY --from=build /app/dist/block-game/browser/ /usr/share/nginx/html


HEALTHCHECK --interval=30s --timeout=3s CMD wget -O /dev/null http://localhost/health || exit 1
