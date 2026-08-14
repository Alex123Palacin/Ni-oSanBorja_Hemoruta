FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/opt/hemoruta/modelos

WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends -y ffmpeg libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY BackEnd/principal/requirements.txt /tmp/requirements.txt
RUN python -m pip install --upgrade pip \
    && python -m pip install -r /tmp/requirements.txt

COPY BackEnd/principal /app
COPY BackEnd/docker-entrypoint.sh /usr/local/bin/hemoruta-backend
RUN chmod +x /usr/local/bin/hemoruta-backend

EXPOSE 8000

ENTRYPOINT ["hemoruta-backend"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
