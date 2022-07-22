FROM node:16-alpine as build
WORKDIR /app
COPY ./package.json .
COPY ./package-lock.json .
RUN npm ci
COPY ./angular.json .
COPY tsconfig.json .
COPY tsconfig.app.json .
COPY src ./src

RUN npm run build

FROM nginx:alpine
ARG APP
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/block-game /usr/share/nginx/html


HEALTHCHECK --interval=30s --timeout=3s CMD wget -O /dev/null http://localhost/health || exit 1