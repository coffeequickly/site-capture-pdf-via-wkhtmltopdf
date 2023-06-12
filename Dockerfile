# Stage 1: Build the application
FROM node:18 as build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i --only=production
COPY . .

# Stage 2: Create the production image
FROM node:18-alpine
WORKDIR /usr/src/app
RUN apk update && apk add --no-cache \
    chromium \
    harfbuzz \
    fontconfig \
    && rm -rf /var/cache/apk/*

# Stage 3: Additional default fonts
COPY ./fonts /usr/share/fonts/
RUN fc-cache -f -v


ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY --from=build /usr/src/app .

EXPOSE 3000

CMD [ "node", "app.js" ]
