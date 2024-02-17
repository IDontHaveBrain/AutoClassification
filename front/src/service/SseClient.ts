import {sendOk} from "./GlobalApi";
import CONSTANT from "../utils/constant/constant";
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';

type MessageHandler = (data: any) => void;
type ErrorHandler = (err: Event) => void;

const INITIAL_DELAY = 5000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5*1000;

const EventSource = NativeEventSource || EventSourcePolyfill;
// OR: may also need to set as global property
global.EventSource =  NativeEventSource || EventSourcePolyfill;

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
            const error = new Error('Invalid URL: ' + url);
            console.error('Invalid URL', url);
            errorHandler(new ErrorEvent('error', { error }));
            throw error;
        }

        try {
            const access_token = sessionStorage.getItem(CONSTANT.ACCESS_TOKEN);
            this.eventSource = new EventSourcePolyfill(url, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });
        } catch (e) {
            console.error('Failed to create EventSource', e);
            errorHandler(e);
            throw e;
        }

        this.eventSource.onmessage = (event: any) => {  // Added type any for broad compatibility
            let receivedData;

            // JSON parse with error handling
            try {
                receivedData = JSON.parse(event.data);
                messageHandler(receivedData);
            } catch (e) {
                console.error('Invalid JSON', e);
                messageHandler(event.data);
                // errorHandler(e);
            }
        };

        this.eventSource.onerror = (err: any) => {  // Added type any for broad compatibility
            errorHandler(err);
            if (this.eventSource?.readyState === EventSource.CLOSED) {
                this.reconnect(url, messageHandler, errorHandler);
            }
        };

        this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), SseClient.INITIAL_DELAY);
    }

    reconnect(url: string, messageHandler: MessageHandler, errorHandler: ErrorHandler): void {
        // Limit the number of reconnect attempts
        if (this.reconnectCount < SseClient.MAX_RETRIES) {
            setTimeout(() => this.connect(url, messageHandler, errorHandler), SseClient.RETRY_DELAY);
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

    sendHeartbeat(retryCount = 0): void {
        if (this.isConnected()) {
            sendOk().then(() => {
                console.log('Heartbeat sent');
                if (retryCount < SseClient.MAX_RETRIES) {
                    retryCount = 0; // Reset retry count on successful send
                }
            }).catch((err) => {
                console.error('Failed to send heartbeat', err);
                if (retryCount < SseClient.MAX_RETRIES) {
                    setTimeout(() => this.sendHeartbeat(retryCount + 1), SseClient.RETRY_DELAY); // Retry send on failure
                } else {
                    console.error('Max retries exceeded');
                    retryCount = 0; // Reset retry count after max retries exceeded
                    this.disconnect();
                }
            });
        }
    }

    isValidUrl(url: string): boolean {
        try {
            new URL(url)
        } catch (_) {
            return false
        }

        return true
    }
}

export default SseClient;