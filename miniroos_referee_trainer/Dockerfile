ARG BUILD_FROM=ghcr.io/home-assistant/base:latest
FROM $BUILD_FROM

WORKDIR /app

COPY requirements.txt /app/
COPY app.py questions.py /app/
COPY templates /app/templates
COPY static /app/static
COPY run.sh /run.sh

RUN apk add --no-cache python3 py3-pip \
    && pip3 install --no-cache-dir --break-system-packages -r /app/requirements.txt \
    && chmod a+x /run.sh

CMD ["/run.sh"]
