FROM node:16-alpine

RUN apk add --no-cache \
    fontconfig \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    chromium \
    nss

# 일반 사용자 추가
RUN addgroup -S pdfmaker && adduser -S pdfmaker -G pdfmaker

# 일반 사용자로 전환
USER pdfmaker

#폰트 설치
# /statics/fonts 아래에 있는 모든 폰트 설치
COPY statics/fonts /usr/share/fonts/truetype


RUN fc-cache -f

WORKDIR /app

COPY package*.json ./
RUN yarn install
COPY . .

EXPOSE 3000

CMD ["yarn", "start"]
