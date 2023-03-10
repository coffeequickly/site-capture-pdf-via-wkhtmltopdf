FROM node:alpine

RUN apk add --no-cache \
    fontconfig \
    freetype \
    harfbuzz \
    unzip \
    ca-certificates \
    ttf-freefont \
    chromium \
    nss



# 폰트 설치
RUN wget http://cdn.naver.com/naver/NanumFont/fontfiles/NanumFont_TTF_ALL.zip && \
    unzip NanumFont_TTF_ALL.zip -d NanumFont && \
    rm -f NanumFont_TTF_ALL.zip && \
    mv NanumFont /usr/share/fonts/


# TODO: /statics/fonts 아래에 있는 모든 폰트 설치 - 폰트가 많아지면 느려질 수 있음. 볼륨으로 처리 필요.
#COPY statics/fonts /usr/share/fonts/truetype

RUN fc-cache -f

# 일반 사용자 추가
RUN addgroup -S pdfmaker && adduser -S pdfmaker -G pdfmaker

# pdfmaker 사용자로 전환
USER pdfmaker


WORKDIR /app

COPY package*.json ./
RUN yarn install --pure-lockfile
COPY . .

EXPOSE 3000

CMD ["yarn", "start"]
