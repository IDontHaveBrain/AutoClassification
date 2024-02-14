import {sendOk} from "./GlobalApi";

type MessageHandler = (data: any) => void;
type ErrorHandler = (err: Event) => void;

const INITIAL_DELAY = 5000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5*1000;

class SseClient {
    private eventSource: EventSource | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private reconnectCount: number = 0;
    private static readonly INITIAL_DELAY = 5000;
    private static readonly MAX_RETRIES = 2;
    private static readonly RETRY_DELAY = 5*1000;

    connect(url: string, messageHandler: MessageHandler, errorHandler: ErrorHandler): void {
        this.disconnect(); // Ensure we're not already connected
        if (!this.isValidUrl(url)) {
            console.error('Invalid URL', url);
            errorHandler(new ErrorEvent('error', { error: new Error('Invalid URL: ' + url) }));
            return;
        }

        try {
            this.eventSource = new EventSource(url);
        } catch (e) {
            console.error('Failed to create EventSource', e);
            errorHandler(e);
            return;
        }

        this.eventSource.onmessage = (event) => {
            let receivedData;

            // JSON parse with error handling
            try {
                receivedData = JSON.parse(event.data);
                messageHandler(receivedData);
            } catch (e) {
                console.error('Invalid JSON', e);
                errorHandler(e);
            }
        };

        this.eventSource.onerror = (err) => {
            errorHandler(err);
            this.reconnect(url, messageHandler, errorHandler);
        };

        this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), INITIAL_DELAY);
    }

    reconnect(url: string, messageHandler: MessageHandler, errorHandler: ErrorHandler): void {
        // Limit the number of reconnect attempts
        if (this.reconnectCount < MAX_RETRIES) {
            setTimeout(() => this.connect(url, messageHandler, errorHandler), 5000);
            this.reconnectCount++;
        } else {
            console.error('Max reconnect attempts exceeded');
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
        return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
    }

    sendHeartbeat(maxRetries = MAX_RETRIES, retryCount = 0): void {
        if (this.isConnected()) {
            sendOk().then(() => {
                console.log('Heartbeat sent');
                this.retrySendHeartbeat(maxRetries);
            }).catch((err) => {
                console.error('Failed to send heartbeat', err);
                if (retryCount < maxRetries) {
                    this.retrySendHeartbeat(maxRetries, retryCount + 1);
                } else {
                    console.error('Max retries exceeded');
                    this.disconnect();
                }
            });
        }
    }

    retrySendHeartbeat(maxRetries: number, retryCount = 0): void {
        setTimeout(() => this.sendHeartbeat(maxRetries, retryCount), RETRY_DELAY);
    }

    isValidUrl(string: string) {
        try {
            new URL(string)
        } catch (_) {
            return false
        }

        return true
    }
}

export default SseClient;