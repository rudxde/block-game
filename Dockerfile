FROM --platform=$BUILDPLATFORM node:18-alpine as build
WORKDIR /app
COPY ./package.json .
COPY ./package-lock.json .
RUN npm ci
COPY ./angular.json .
COPY ./ngsw-config.json .
COPY tsconfig.json .
COPY tsconfig.app.json .
COPY src ./src

RUN npm run build:prod

FROM nginx:alpine
ARG APP
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/block-game/3rdpartylicenses.txt /usr/share/nginx/html
COPY --from=build /app/dist/block-game/browser /usr/share/nginx/html


HEALTHCHECK --interval=30s --timeout=3s CMD wget -O /dev/null http://localhost/health || exit 1
