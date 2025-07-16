import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type SseEvent, SseType } from 'model/GlobalModel';
import { closeSnackbar, SnackbarProvider, type SnackbarProviderProps,useSnackbar } from 'notistack';
import SseManager, { type ErrorHandler } from 'service/commons/SseManager';
import { useAppSelector } from 'stores/rootHook';

import AlertModal from 'components/modal/AlertModal';
import { CONSTANT, URLS } from 'utils/constant';
import { eventBus } from 'utils/eventBus';

const DEFAULT_SNACKBAR_DURATION = 3000;

export const CustomSnackbarProvider: React.FC<SnackbarProviderProps> = (props) => (
    <SnackbarProvider
        {...props}
        autoHideDuration={DEFAULT_SNACKBAR_DURATION}
    />
);

const BackGround: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [, setIsConnected] = useState(false);
    const [showReconnectingMessage, setShowReconnectingMessage] = useState(false);
    const [reconnectMessageTimeout, setReconnectMessageTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [hasShownConnectionToast, setHasShownConnectionToast] = useState(false);
    const [lastErrorToastTime, setLastErrorToastTime] = useState(0);
    const isAuthenticated = useAppSelector((state) => !!state.userInfo.access_token);
    const { t } = useTranslation('common');

    const handleSseMessage = useCallback((event: SseEvent) => {
        try {
            if (event.type === SseType.ALARM) {
                let alarmData;
                try {
                    alarmData = JSON.parse(event.data);
                } catch (_parseError) {
                    return;
                }

                if (alarmData && alarmData.title) {
                    enqueueSnackbar(alarmData.title, {
                        variant: 'success',
                        autoHideDuration: 6000, // Keep notification for 6 seconds
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
                }
            }
            // Parse string data to appropriate type based on event type
            try {
                const parsedData = JSON.parse(event.data);
                eventBus.publish(event.type, parsedData);
            } catch (_parseError) {
                // If parsing fails, only publish for HEARTBEAT type with timestamp
                if (event.type === SseType.HEARTBEAT) {
                    eventBus.publish(event.type, { timestamp: event.timestamp });
                }
            }
        } catch (_error) {
            // Silently ignore message processing errors
        }
    }, [enqueueSnackbar]);

    const handleSseError = useCallback<ErrorHandler>((_error: Error) => {
        const now = Date.now();
        // Debounce error toasts - only show if last error toast was more than 5 seconds ago
        if (now - lastErrorToastTime > 5000) {
            enqueueSnackbar(t('sseConnectionError'), { variant: 'error' });
            setLastErrorToastTime(now);
        }
    }, [enqueueSnackbar, t, lastErrorToastTime]);

    const handleConnectionStatus = useCallback((status: boolean) => {
        setIsConnected(status);

        if (reconnectMessageTimeout) {
            clearTimeout(reconnectMessageTimeout);
            setReconnectMessageTimeout(null);
        }

        if (status) {
            setShowReconnectingMessage(false);
            // Only show connection established toast if we haven't shown it yet
            // or if we're reconnecting after a connection loss
            if (!hasShownConnectionToast || showReconnectingMessage) {
                enqueueSnackbar(t('sseConnectionEstablished'), { variant: 'success' });
                setHasShownConnectionToast(true);
            }
        } else {
            // Reset the connection toast flag when disconnected
            setHasShownConnectionToast(false);
            // Connection lost - show reconnecting message after 3 seconds delay
            const timeout = setTimeout(() => {
                if (isAuthenticated) {
                    setShowReconnectingMessage(true);
                    enqueueSnackbar(t('sseConnectionLost'), { variant: 'warning' });
                }
            }, 3000);

            setReconnectMessageTimeout(timeout);
        }
    }, [enqueueSnackbar, isAuthenticated, reconnectMessageTimeout, hasShownConnectionToast, showReconnectingMessage, t]);

    useEffect(() => {
        const initializeSSE = () => {
            const tok = localStorage.getItem(CONSTANT.ACCESS_TOKEN);
            const sseManager = SseManager.getInstance();
            if (tok && !sseManager.isConnected) {
                sseManager.connect(CONSTANT.API_URL + URLS.API.SSE.SUBSCRIBE);
                sseManager.addMessageHandler(handleSseMessage);
                sseManager.addErrorHandler(handleSseError);
                sseManager.onConnectionStatusChange(handleConnectionStatus);
            }
        };

        // Attempt SSE connection on initial load
        if (!SseManager.getInstance().isConnected) {
            initializeSSE();
        }

        // Add login event listener
        window.addEventListener('userLoggedIn', initializeSSE);

        return () => {
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
                    ⚠️ {t('connectionLostReconnecting')}
                </div>
            )}
        </>
    );
};

export default BackGround;
