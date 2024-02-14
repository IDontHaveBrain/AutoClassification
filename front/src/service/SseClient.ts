type MessageHandler = (data: any) => void;
type ErrorHandler = (err: Event) => void;

class SseClient {
    private eventSource: EventSource | null = null;

    connect(url: string, messageHandler: MessageHandler, errorHandler: ErrorHandler): void {
        this.disconnect(); // Ensure we're not already connected

        this.eventSource = new EventSource(url);

        this.eventSource.onmessage = (event) => {
            const receivedData = JSON.parse(event.data);
            messageHandler(receivedData);
        };

        this.eventSource.onerror = errorHandler;
    }

    disconnect(): void {
        this.eventSource?.close();
        this.eventSource = null;
    }

    isConnected(): boolean {
        return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
    }
}

export default SseClient;