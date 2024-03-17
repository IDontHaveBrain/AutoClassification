FROM python:3.11.8-alpine
LABEL authors="nj.jo"

EXPOSE 5000

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "app.py"]