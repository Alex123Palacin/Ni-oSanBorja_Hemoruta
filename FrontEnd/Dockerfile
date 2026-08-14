FROM node:24-alpine AS build

WORKDIR /app

COPY FrontEnd/package.json FrontEnd/package-lock.json ./
RUN npm ci

COPY FrontEnd ./

ARG VITE_API_URL=http://localhost:8090/api/v1
ARG VITE_API_TOKEN_SCHEME=Bearer
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_API_TOKEN_SCHEME=${VITE_API_TOKEN_SCHEME}

RUN npm run build

FROM nginx:1.29-alpine

COPY FrontEnd/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
