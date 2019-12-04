FROM node:10-alpine
LABEL MAINTAINER="taoyouyou"
RUN apk update && apk upgrade && \
    echo http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache \
      zlib-dev \
      xvfb \
      xorg-server \
      dbus \
      ttf-freefont \
      chromium \
      nss \
      ca-certificates \
      dumb-init