import React, { useCallback, useEffect, useState } from "react";
import { SseEvent, SseType } from "model/GlobalModel";
import SseManager, { ErrorHandler } from "service/commons/SseManager";
import { CONSTANT, URLS } from "utils/constant";
import AlertModal from "component/modal/AlertModal";
import { useSnackbar, closeSnackbar, SnackbarProvider, SnackbarProviderProps, SnackbarContent } from "notistack";
import { useAppSelector } from "stores/rootHook";

const DEFAULT_SNACKBAR_DURATION = 3000; // 3 seconds in milliseconds

export const CustomSnackbarProvider: React.FC<SnackbarProviderProps> = (props) => (
    <SnackbarProvider
        {...props}
        autoHideDuration={DEFAULT_SNACKBAR_DURATION}
    />
);

const eventBus = {
    listeners: new Map<SseType, ((data: any) => void)[]>(),
    subscribe(event: SseType, callback: (data: any) => void) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
    },
    unsubscribe(event: SseType, callback: (data: any) => void) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    },
    publish(event: SseType, data: any) {
        if (this.listeners.has(event)) {
            this.listeners.get(event)?.forEach((callback) => callback(data));
        }
    }
};

const BackGround: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [isConnected, setIsConnected] = useState(false);
    const [showReconnectingMessage, setShowReconnectingMessage] = useState(false);
    const [reconnectMessageTimeout, setReconnectMessageTimeout] = useState<NodeJS.Timeout | null>(null);
    const isAuthenticated = useAppSelector((state) => !!state.userInfo.access_token);

    const handleSseMessage = useCallback((event: SseEvent) => {
        console.log("Received SSE message in BackGround:", event);
        try {
            if (event.type === SseType.ALARM) {
                console.log("Received ALARM event in BackGround");
                let alarmData;
                try {
                    alarmData = JSON.parse(event.data);
                    console.log("Parsed Alarm data in BackGround:", alarmData);
                } catch (parseError) {
                    console.error("Error parsing alarm data:", parseError);
                    return;
                }
                
                if (alarmData && alarmData.title) {
                    enqueueSnackbar(alarmData.title, {
                        variant: "success",
                        autoHideDuration: 6000, // 6초 유지
                        anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'center',
                        },
                        SnackbarProps: {
                            onClick: () => {
                                closeSnackbar();
                            },
                        },
                    });
                    eventBus.publish(SseType.ALARM, alarmData);
                } else {
                    console.error("Invalid alarm data structure:", alarmData);
                }
            }
            eventBus.publish(event.type, event.data);
        } catch (error) {
            console.error("Error processing SSE message in BackGround:", error);
        }
    }, [enqueueSnackbar]);

    const handleSseError = useCallback<ErrorHandler>((error: Error) => {
        console.error("SSE Error:", error);
        // eventBus.publish("sseError", error);
        enqueueSnackbar("SSE connection error. Attempting to reconnect...", { variant: "error" });
    }, [enqueueSnackbar]);

    const handleConnectionStatus = useCallback((status: boolean) => {
        console.log("SSE connection status changed:", status);
        setIsConnected(status);
        
        // Clear any existing timeout
        if (reconnectMessageTimeout) {
            clearTimeout(reconnectMessageTimeout);
            setReconnectMessageTimeout(null);
        }
        
        if (status) {
            // Connection restored
            setShowReconnectingMessage(false);
            enqueueSnackbar("SSE connection established", { variant: "success" });
        } else {
            // Connection lost - show reconnecting message after 3 seconds delay
            const timeout = setTimeout(() => {
                if (isAuthenticated) {
                    setShowReconnectingMessage(true);
                    enqueueSnackbar("SSE connection lost. Attempting to reconnect...", { variant: "warning" });
                }
            }, 3000); // 3 second delay before showing reconnecting message
            
            setReconnectMessageTimeout(timeout);
        }
    }, [enqueueSnackbar, isAuthenticated, reconnectMessageTimeout]);

    useEffect(() => {
        const initializeSSE = () => {
            const tok = sessionStorage.getItem(CONSTANT.ACCESS_TOKEN);
            const sseManager = SseManager.getInstance();
            if (tok && !sseManager.isConnected) {
                console.log("Connecting to SSE...");
                sseManager.connect(CONSTANT.API_URL + URLS.API.SSE.SUBSCRIBE);
                sseManager.addMessageHandler(handleSseMessage);
                sseManager.addErrorHandler(handleSseError);
                sseManager.onConnectionStatusChange(handleConnectionStatus);
            }
        };

        // 초기 로드 시 SSE 연결 시도
        if (!SseManager.getInstance().isConnected) {
            initializeSSE();
        }

        // 로그인 이벤트 리스너 추가
        window.addEventListener('userLoggedIn', initializeSSE);

        return () => {
            console.log("Cleaning up SSE connection...");
            
            // Clear reconnect message timeout
            if (reconnectMessageTimeout) {
                clearTimeout(reconnectMessageTimeout);
            }
            
            const sseManager = SseManager.getInstance();
            sseManager.removeMessageHandler(handleSseMessage);
            sseManager.removeErrorHandler(handleSseError);
            sseManager.removeConnectionStatusHandler(handleConnectionStatus);
            sseManager.disconnect();
            window.removeEventListener('userLoggedIn', initializeSSE);
        };
    }, [handleSseMessage, handleSseError, handleConnectionStatus, reconnectMessageTimeout]);

    return (
        <>
            <AlertModal />
            {showReconnectingMessage && isAuthenticated && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: 'orange', color: 'white', textAlign: 'center', padding: '8px', zIndex: 9999, fontSize: '14px', fontWeight: 'bold' }}>
                    ⚠️ Connection lost. Reconnecting to server...
                </div>
            )}
        </>
    );
};

export { BackGround as default, eventBus };
