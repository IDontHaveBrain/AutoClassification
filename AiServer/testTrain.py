from ultralytics import YOLO
import config

def main():
    print("Hello, World!")
    model = YOLO('yolov8s-cls.yaml').load('yolov8s-cls.pt')
    model.info()

    results = model.train(data=config.BASE_DIR+'/workspace/test', epochs=30, imgsz=512, batch=-1)


if __name__ == "__main__":
    main()
