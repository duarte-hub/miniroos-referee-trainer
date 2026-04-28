ARG BUILD_ARCH
FROM ghcr.io/home-assistant/${BUILD_ARCH}-base:latest

WORKDIR /app

COPY app.py questions.py /app/
COPY templates /app/templates
COPY static /app/static
COPY run.sh /run.sh

RUN apk add --no-cache python3 \
    && chmod a+x /run.sh

CMD ["/run.sh"]
