from ultralytics import YOLO
import config

def main():
    print("Hello, World!")
    model = YOLO('yolov8s-cls.pt')
    model.info()

    results = model.train(data=config.BASE_DIR+'/workspace/test', epochs=25, imgsz=416)


if __name__ == "__main__":
    main()
