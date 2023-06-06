# Stage 1: Build the application
FROM node:18 as build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm i --only=production

# Copy the rest of the application
COPY . .

# Stage 2: Create the production image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Install Chromium and fonts to support major charsets
RUN apk update && apk add \
    chromium \
    harfbuzz \
    fontconfig \
    && rm -rf /var/cache/apk/*

RUN wget http://cdn.naver.com/naver/NanumFont/fontfiles/NanumFont_TTF_ALL.zip && \
    unzip NanumFont_TTF_ALL.zip -d NanumFont && \
    rm -f NanumFont_TTF_ALL.zip && \
    mv NanumFont /usr/share/fonts/

RUN fc-cache -f

# Set the Chromium path
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy the built application from the previous stage
COPY --from=build /usr/src/app .

# Expose port 3000
EXPOSE 3000

# Start the application
CMD [ "node", "app.js" ]
