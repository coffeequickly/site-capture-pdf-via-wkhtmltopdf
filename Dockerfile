FROM amazonlinux:2

RUN yum -y update && yum -y install \
    fontconfig \
    libjpeg-turbo \
    libpng \
    libX11 \
    libXext \
    tar \
    wget \
    gzip \
    unzip \
    && yum -y install \
    gcc-c++ make \
    && curl -sL https://rpm.nodesource.com/setup_16.x | bash - \
    && yum install -y nodejs \
    && npm install -g npm \
    && yum clean all

RUN yum -y install \
    ipa-gothic-fonts \
    libXrender \
    && fc-cache -fv

#폰트 설치
# /statics/fonts 아래에 있는 모든 폰트 설치
COPY statics/fonts /usr/share/fonts/truetype


RUN fc-cache -f && \
    fc-cache-64 -f

RUN wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox-0.12.6-1.amazonlinux2.x86_64.rpm && \
    yum -y localinstall wkhtmltox-0.12.6-1.amazonlinux2.x86_64.rpm && \
    rm wkhtmltox-0.12.6-1.amazonlinux2.x86_64.rpm && \
    yum clean all

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
