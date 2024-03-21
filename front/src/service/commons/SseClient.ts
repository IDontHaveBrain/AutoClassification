import { sendOk } from "service/GlobalApi";
import { CONSTANT } from "../../utils/constant";
import { NativeEventSource, EventSourcePolyfill } from "event-source-polyfill";

type MessageHandler = (data: any) => void;
type ErrorHandler = (err: Event) => void;

const INITIAL_DELAY = 5000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5 * 1000;

const EventSource = EventSourcePolyfill || NativeEventSource;
global.EventSource = EventSourcePolyfill || NativeEventSource;

class SseClient {
  private eventSource: EventSource | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectCount: number = 0;
  private static readonly INITIAL_DELAY = 25000;
  private static readonly MAX_RETRIES = 5;
  private static readonly RETRY_DELAY = 5 * 1000;

  private static instance: SseClient;

  public static getInstance(): SseClient {
    if (!SseClient.instance) {
      SseClient.instance = new SseClient();
    }
    return SseClient.instance;
  }

  public static resetInstance(): SseClient {
    SseClient.instance = new SseClient();
    return SseClient.instance;
  }

  connect(
    url: string,
    messageHandler: MessageHandler,
    errorHandler: ErrorHandler,
  ): void {
    this.disconnect();
    if (!this.isValidUrl(url)) {
      const error = new Error("Invalid URL: " + url);
      console.error("Invalid URL", url);
      errorHandler(new ErrorEvent("error", { error }));
      throw error;
    }

    try {
      const access_token = sessionStorage.getItem(CONSTANT.ACCESS_TOKEN);
      this.eventSource = new EventSourcePolyfill(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        heartbeatTimeout: 120 * 1000,
      });
    } catch (e) {
      console.error("Failed to create EventSource", e);
      errorHandler(e);
      throw e;
    }

    this.eventSource.onmessage = (event: any) => {
      console.log("event.data : ", event.data);
      let receivedData;

      try {
        receivedData = JSON.parse(event.data);
        messageHandler(receivedData);
      } catch (e) {
        console.error("Invalid JSON", e);
        messageHandler(event.data);
        // errorHandler(e);
      }
    };

    this.eventSource.onerror = (err: any) => {
      console.error("EventSource error", err);
      errorHandler(err);
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.reconnect(url, messageHandler, errorHandler);
      }
    };

    // if (this.heartbeatInterval) {
    //     clearInterval(this.heartbeatInterval)
    // };
    // this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), SseClient.INITIAL_DELAY);
  }

  reconnect(
    url: string,
    messageHandler: MessageHandler,
    errorHandler: ErrorHandler,
  ): void {
    // Limit the number of reconnect attempts
    if (this.reconnectCount < SseClient.MAX_RETRIES) {
      setTimeout(
        () => this.connect(url, messageHandler, errorHandler),
        SseClient.RETRY_DELAY,
      );
      this.reconnectCount++;
    } else {
      console.error("Max reconnect attempts exceeded");
      this.disconnect();
    }
  }

  disconnect(): void {
    this.heartbeatInterval && clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = null;
    this.eventSource?.close();
    this.eventSource = null;
  }

  isConnected(): boolean {
    return (
      this.eventSource !== null &&
      this.eventSource.readyState === EventSource.OPEN
    );
  }

  sendHeartbeat(retryCount = 0): void {
    if (this.isConnected()) {
      sendOk()
        .then(() => {
          // console.log("Heartbeat sent");
          if (retryCount < SseClient.MAX_RETRIES) {
            retryCount = 0;
          }
        })
        .catch((err) => {
          console.error("Failed to send heartbeat", err);
          if (retryCount < SseClient.MAX_RETRIES) {
            setTimeout(
              () => this.sendHeartbeat(retryCount + 1),
              SseClient.RETRY_DELAY,
            );
          } else {
            console.error("Max retries exceeded");
            retryCount = 0;
            this.disconnect();
          }
        });
    }
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
    } catch (_) {
      return false;
    }

    return true;
  }
}

export default SseClient;
