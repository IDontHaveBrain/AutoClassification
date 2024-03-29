from ultralytics import YOLO
import config

model = YOLO('C:/Work/AutoClassification/runs/classify/train4/weights/best.pt')
model.info()

metrics = model.val()  # no arguments needed, dataset and settings remembered
metrics.top1   # top1 accuracy
metrics.top5   # top5 accuracy

print(metrics)