import { EventSourcePolyfill } from "event-source-polyfill";
import { CONSTANT } from "../../utils/constant";
import { SseEvent, SseType } from "model/GlobalModel";

type MessageHandler = (data: SseEvent) => void;
export type ErrorHandler = (err: Error) => void;
type ConnectionStatusHandler = (isConnected: boolean) => void;

class SseManager {
    private static instance: SseManager;
    private eventSource: EventSourcePolyfill | null = null;
    private reconnectAttempts: number = 0;
    private messageQueue: SseEvent[] = [];
    public isConnected: boolean = false;
    private messageHandlers: Set<MessageHandler> = new Set();
    private errorHandlers: Set<ErrorHandler> = new Set();
    private connectionStatusHandlers: Set<ConnectionStatusHandler> = new Set();
    private url: string = "";
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private readonly MAX_RECONNECT_ATTEMPTS = 5;
    private readonly INITIAL_RECONNECT_DELAY = 1000;

    private constructor() {}

    public static getInstance(): SseManager {
        if (!SseManager.instance) {
            SseManager.instance = new SseManager();
        }
        return SseManager.instance;
    }

    public connect(url: string): void {
        this.url = url;
        this.establishConnection();
    }

    private establishConnection(): void {
        this.disconnect();

        if (!this.isValidUrl(this.url)) {
            this.handleError(new Error(`Invalid URL: ${this.url}`));
            return;
        }

        try {
            const accessToken = sessionStorage.getItem(CONSTANT.ACCESS_TOKEN);
            this.eventSource = new EventSourcePolyfill(this.url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                heartbeatTimeout: 180000, // 3 minutes
                withCredentials: true
            });

            this.eventSource.onopen = this.handleOpen;
            this.eventSource.onerror = this.handleError;
            this.eventSource.onmessage = this.handleMessage;

        } catch (error) {
            this.handleError(error instanceof Error ? error : new Error('Unknown error occurred'));
        }
    }

    private handleOpen = (event: Event): void => {
        console.log("SSE connection opened", event);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.processMessageQueue();
        this.notifyConnectionStatusChange(true);
    }

    private handleError = (event: Event | Error): void => {
        const error = event instanceof Error ? event : new Error('SSE connection error');
        console.error("SSE error:", error);
        this.isConnected = false;
        this.notifyConnectionStatusChange(false);
        this.errorHandlers.forEach(handler => handler(error));
        this.reconnect();
    }

    private handleMessage = (event: MessageEvent): void => {
        console.log("Received SSE event:", event);
        try {
            const parsedData: SseEvent = JSON.parse(event.data);
            console.log("Parsed SSE data:", parsedData);

            if (parsedData.type === SseType.HEARTBEAT) {
                console.log("Received heartbeat");
                return;
            }

            // Create a new SseEvent object with the correct structure
            const sseEvent: SseEvent = {
                id: parsedData.id,
                type: parsedData.type as SseType,
                data: parsedData.data,
                timestamp: parsedData.timestamp
            };

            this.messageHandlers.forEach(handler => handler(sseEvent));
        } catch (error) {
            console.error("Error handling SSE message:", error);
        }
    }

    public disconnect(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.isConnected = false;
        this.notifyConnectionStatusChange(false);
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    public addMessageHandler(handler: MessageHandler): void {
        this.messageHandlers.add(handler);
    }

    public removeMessageHandler(handler: MessageHandler): void {
        this.messageHandlers.delete(handler);
    }

    public addErrorHandler(handler: ErrorHandler): void {
        this.errorHandlers.add(handler);
    }

    public removeErrorHandler(handler: ErrorHandler): void {
        this.errorHandlers.delete(handler);
    }

    public onConnectionStatusChange(handler: ConnectionStatusHandler): void {
        this.connectionStatusHandlers.add(handler);
    }

    public removeConnectionStatusHandler(handler: ConnectionStatusHandler): void {
        this.connectionStatusHandlers.delete(handler);
    }

    public sendMessage(message: SseEvent): void {
        if (this.isConnected) {
            console.log("Sending message:", message);
        } else {
            this.messageQueue.push(message);
        }
    }

    private reconnect(): void {
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            const delay = this.calculateReconnectDelay();
            console.log(`Attempting to reconnect (attempt ${this.reconnectAttempts}) in ${delay}ms...`);
            this.reconnectTimeout = setTimeout(() => {
                this.establishConnection();
            }, delay);
        } else {
            console.error("Max reconnection attempts reached");
        }
    }

    private calculateReconnectDelay(): number {
        return Math.min(
            this.INITIAL_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts),
            30000 // Max delay of 30 seconds
        );
    }

    private processMessageQueue(): void {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            if (message) {
                this.sendMessage(message);
            }
        }
    }

    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    private notifyConnectionStatusChange(isConnected: boolean): void {
        this.connectionStatusHandlers.forEach(handler => handler(isConnected));
    }
}

export default SseManager;
