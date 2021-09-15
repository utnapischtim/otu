FROM php:7.4-alpine

WORKDIR /usr/src/app

COPY ./public ./

EXPOSE 8080

CMD [ "php", "-S", "0.0.0.0:8080" ]
