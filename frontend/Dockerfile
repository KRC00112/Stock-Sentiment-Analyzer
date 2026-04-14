FROM node:25-alpine3.22 AS build_stage

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

FROM nginx:1.27.0 AS production_stage

RUN rm -rf /usr/share/nginx/html

COPY --from=build_stage app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf