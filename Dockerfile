FROM node:alpine

RUN apk add --no-cache \
    fontconfig \
    freetype \
    harfbuzz \
    unzip \
    ca-certificates \
    ttf-freefont \
    chromium \
    nss \
    yarn

# 폰트 설치
RUN wget http://cdn.naver.com/naver/NanumFont/fontfiles/NanumFont_TTF_ALL.zip && \
    unzip NanumFont_TTF_ALL.zip -d NanumFont && \
    rm -f NanumFont_TTF_ALL.zip && \
    mv NanumFont /usr/share/fonts/

RUN fc-cache -f

# 일반 사용자 추가
RUN addgroup -S pdfmaker && adduser -S pdfmaker -G pdfmaker

# 프로젝트 폴더 생성 및 권한 설정
RUN mkdir /app && chown pdfmaker:pdfmaker /app
WORKDIR /app

# pdfmaker 사용자로 전환
USER pdfmaker

COPY package*.json ./
RUN yarn install --pure-lockfile
COPY . .

EXPOSE 3000

CMD ["yarn", "start"]
