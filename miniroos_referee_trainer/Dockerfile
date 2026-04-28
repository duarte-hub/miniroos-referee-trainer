ARG BUILD_FROM=python:3.12-alpine
FROM ${BUILD_FROM}

WORKDIR /app

COPY app.py questions.py /app/
COPY templates /app/templates
COPY static /app/static
COPY run.sh /run.sh

RUN chmod a+x /run.sh

CMD ["/run.sh"]
