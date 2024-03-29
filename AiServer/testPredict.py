from ultralytics import YOLO
import config


model = YOLO('C:/Work/AutoClassification/runs/classify/train4/weights/best.pt')

results = model('C:/Users/skawn/Downloads/img')