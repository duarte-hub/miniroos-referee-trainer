ARG BUILD_FROM=ghcr.io/home-assistant/base:latest
FROM $BUILD_FROM

WORKDIR /app

COPY app.py questions.py /app/
COPY templates /app/templates
COPY static /app/static
COPY run.sh /run.sh

RUN apk add --no-cache python3 py3-flask \
    && chmod a+x /run.sh

CMD ["/run.sh"]
