FROM node:8-alpine
RUN npm install -g forever
CMD forever ./server/app.js
RUN mkdir app
WORKDIR /app
COPY ["package.json","package-lock.json","./"]
RUN npm i
COPY . .
RUN npm run build
VOLUME server ./server
VOLUME /var/run/docker.sock /var/run/docker.sock
