import {Badge, IconButton} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SseClient from "../../service/SseClient";
import {useCallback, useEffect, useState} from "react";
import {CONSTANT, URLS} from "../../utils/constant";
import {useAppDispatch, useAppSelector} from "../../store/rootHook";
import {resetSseClient} from "../../store/rootSlice";

interface Props {
    sse?: SseClient;
}

const RECONNECTION_DELAY = 5000; // 재연결 대기 시간

const Notification = ({}: Props) => {
    const sseClient = useAppSelector(state => state.sse.sseClient);
    const dispatch = useAppDispatch();

    const handleSseMessage = useCallback((event: MessageEvent) => {
        console.log(event);
    }, [sseClient]);

    const handleSseError = useCallback((event: Event) => {
        if (sseClient?.isConnected()) {
            sseClient.disconnect();
        }
        // 일정 대기 후에 재연결
        setTimeout(() => {
            sseClient.connect(CONSTANT.API_URL + URLS.API.SSE.SUBSCRIBE, handleSseMessage, handleSseError);
        }, RECONNECTION_DELAY)
    }, [sseClient]);

    useEffect(() => {
        if (sseClient && !sseClient.isConnected()) {
            sseClient.connect(CONSTANT.API_URL + URLS.API.SSE.SUBSCRIBE, handleSseMessage, handleSseError);
        }

        return () => {
            sseClient?.disconnect();
            dispatch(resetSseClient());
        }
    }, []);

    return (
        <IconButton color="inherit">
            <Badge badgeContent={4} color="secondary">
                <NotificationsIcon/>
            </Badge>
        </IconButton>
    )
}

export default Notification;