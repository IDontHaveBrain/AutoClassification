import { EventSourcePolyfill } from 'event-source-polyfill';
import { type SseEvent, SseType } from 'model/GlobalModel';

import { CONSTANT } from '../../utils/constant';

import { UserApi } from './ApiClient';

type MessageHandler = (_data: SseEvent) => void;
export type ErrorHandler = (_err: Error) => void;
type ConnectionStatusHandler = (_isConnected: boolean) => void;

class SseManager {
    private static instance: SseManager;
    private eventSource: EventSourcePolyfill | null = null;
    private reconnectAttempts: number = 0;
    private messageQueue: SseEvent[] = [];
    public isConnected: boolean = false;
    private messageHandlers: Set<MessageHandler> = new Set();
    private errorHandlers: Set<ErrorHandler> = new Set();
    private connectionStatusHandlers: Set<ConnectionStatusHandler> = new Set();
    private url: string = '';
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private heartbeatMonitorTimeout: ReturnType<typeof setInterval> | null = null;
    private lastHeartbeatReceived: number = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 10;
    private readonly INITIAL_RECONNECT_DELAY = 1000;
    private readonly HEARTBEAT_TIMEOUT = 60000; // 60 seconds

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
                    Authorization: `Bearer ${accessToken}`,
                },
                heartbeatTimeout: this.HEARTBEAT_TIMEOUT,
                withCredentials: true,
            });

            this.eventSource.onopen = this.handleOpen;
            this.eventSource.onerror = this.handleError;
            this.eventSource.onmessage = this.handleMessage;

        } catch (_error) {
            this.handleError(_error instanceof Error ? _error : new Error('Unknown error occurred'));
        }
    }

    private handleOpen = (_event: Event): void => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.lastHeartbeatReceived = Date.now();
        this.startHeartbeatMonitoring();
        this.processMessageQueue();
        this.notifyConnectionStatusChange(true);
    };

    private handleError = (event: Event | Error): void => {
        const error = event instanceof Error ? event : new Error('SSE connection error');
        this.isConnected = false;
        this.notifyConnectionStatusChange(false);
        this.errorHandlers.forEach(handler => handler(error));
        this.reconnect();
    };

    private handleMessage = (event: MessageEvent): void => {
        try {
            const parsedData: SseEvent = JSON.parse(event.data);

            if (parsedData.type === SseType.HEARTBEAT) {
                this.lastHeartbeatReceived = Date.now();
                this.sendHeartbeatResponse();
                return;
            }

            // Create a new SseEvent object with the correct structure
            const sseEvent: SseEvent = {
                id: parsedData.id,
                type: parsedData.type as SseType,
                data: parsedData.data,
                timestamp: parsedData.timestamp,
            };

            this.messageHandlers.forEach(handler => handler(sseEvent));
        } catch (_error) {
            // 에러 처리
        }
    };

    public disconnect(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.isConnected = false;
        this.stopHeartbeatMonitoring();
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
            // 메시지 전송 처리
        } else {
            this.messageQueue.push(message);
        }
    }

    private reconnect(): void {
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            const delay = this.calculateReconnectDelay();
            this.reconnectTimeout = setTimeout(() => {
                this.establishConnection();
            }, delay);
        } else {
            // 최대 재연결 시도 횟수 초과
        }
    }

    private calculateReconnectDelay(): number {
        return Math.min(
            this.INITIAL_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts),
            30000,
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

    private startHeartbeatMonitoring(): void {
        this.stopHeartbeatMonitoring();
        this.heartbeatMonitorTimeout = setInterval(() => {
            const now = Date.now();
            if (this.isConnected &&
                this.lastHeartbeatReceived > 0 &&
                now - this.lastHeartbeatReceived > this.HEARTBEAT_TIMEOUT) {
                this.handleError(new Error('Heartbeat timeout'));
            }
        }, 30000);
    }

    private stopHeartbeatMonitoring(): void {
        if (this.heartbeatMonitorTimeout) {
            clearInterval(this.heartbeatMonitorTimeout);
            this.heartbeatMonitorTimeout = null;
        }
    }

    private sendHeartbeatResponse(): void {
        try {
            UserApi.post('/sse/heartbeat-response', {
                timestamp: Date.now(),
            }).catch(_error => {
                // 에러 처리
            });
        } catch (_error) {
            // 에러 처리
        }
    }
}

export default SseManager;
