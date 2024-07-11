# For more information, please refer to https://aka.ms/vscode-docker-python
FROM python:3.8-slim

EXPOSE 5000

# Install mysql client (used by python library)
RUN apt-get update \
    && apt-get install --no-install-recommends -y gcc libmariadb-dev-compat libmariadb-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install pip requirements
ADD requirements.txt .
RUN python -m pip install -r requirements.txt

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE 1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED 1

# Set development, production or testing
ENV FLASK_ENV development

WORKDIR /app
ADD . /app

# Switching to a non-root user, please refer to https://aka.ms/vscode-docker-python-user-rights
RUN useradd appuser && chown -R appuser /app
USER appuser

# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
CMD ["gunicorn", "--timeout", "600", "--log-level", "debugging", "--log-file", "-", "-w", "4", "-b", "0.0.0.0:5000", "my-map-in-flask:app"]
