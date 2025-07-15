import React, { useCallback, useEffect, useState } from 'react';
import AlertModal from 'component/modal/AlertModal';
import { type SseEvent, SseType } from 'model/GlobalModel';
import { closeSnackbar, SnackbarProvider, type SnackbarProviderProps,useSnackbar } from 'notistack';
import SseManager, { type ErrorHandler } from 'service/commons/SseManager';
import { useAppSelector } from 'stores/rootHook';

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
    const isAuthenticated = useAppSelector((state) => !!state.userInfo.access_token);

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
                }
            }
            eventBus.publish(event.type, event.data);
        } catch (_error) {
        }
    }, [enqueueSnackbar]);

    const handleSseError = useCallback<ErrorHandler>((_error: Error) => {
        enqueueSnackbar('SSE connection error. Attempting to reconnect...', { variant: 'error' });
    }, [enqueueSnackbar]);

    const handleConnectionStatus = useCallback((status: boolean) => {
        setIsConnected(status);

        if (reconnectMessageTimeout) {
            clearTimeout(reconnectMessageTimeout);
            setReconnectMessageTimeout(null);
        }

        if (status) {
            setShowReconnectingMessage(false);
            enqueueSnackbar('SSE connection established', { variant: 'success' });
        } else {
            // Connection lost - show reconnecting message after 3 seconds delay
            const timeout = setTimeout(() => {
                if (isAuthenticated) {
                    setShowReconnectingMessage(true);
                    enqueueSnackbar('SSE connection lost. Attempting to reconnect...', { variant: 'warning' });
                }
            }, 3000);

            setReconnectMessageTimeout(timeout);
        }
    }, [enqueueSnackbar, isAuthenticated, reconnectMessageTimeout]);

    useEffect(() => {
        const initializeSSE = () => {
            const tok = sessionStorage.getItem(CONSTANT.ACCESS_TOKEN);
            const sseManager = SseManager.getInstance();
            if (tok && !sseManager.isConnected) {
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

export default BackGround;
