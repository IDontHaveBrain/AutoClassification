FROM python:3.11
LABEL authors="nj.jo"

RUN apt-get update && apt-get install -y libgl1-mesa-dev

EXPOSE 5000

WORKDIR /app

COPY requirements.txt .
RUN python -m venv /venv
RUN /venv/bin/pip install -r requirements.txt

COPY . .

CMD ["/venv/bin/python", "app.py"]