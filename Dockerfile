FROM node:lts-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
RUN ./node_modules/anyproxy/bin/anyproxy-ca --generate
COPY src src
ENV PROXY_HTTP_PORT 8080
EXPOSE 8080
CMD [ "npm", "start" ]