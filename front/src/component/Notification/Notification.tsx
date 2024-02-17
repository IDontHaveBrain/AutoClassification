import {Badge, IconButton} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SseClient from "../../service/SseClient";
import {useCallback, useEffect, useState} from "react";
import {CONSTANT, URLS} from "../../utils/constant";
import {useAppDispatch, useAppSelector} from "../../store/rootHook";
import {resetSseClient} from "../../store/rootSlice";
import {AlarmModel} from "../../model/AlarmModel";

interface Props {
    sse?: SseClient;
}

const RECONNECTION_DELAY = 5000; // 재연결 대기 시간

const Notification = () => {
    const [alarmList, setAlarmList] = useState<AlarmModel[]>([]);
    const sseClient = useAppSelector(state => state.sse.sseClient);

    const handleSseMessage = useCallback((event: MessageEvent) => {
        console.log(event);
    }, []);

    const handleSseError = useCallback((event: Event) => {
        console.error(event);
    }, []);

    useEffect(() => {
        if (sseClient && !sseClient.isConnected()) {
            sseClient.connect(CONSTANT.API_URL + URLS.API.SSE.SUBSCRIBE, handleSseMessage, handleSseError);
        }

        return () => {
            sseClient?.disconnect();
        }
    }, [sseClient, handleSseError, handleSseMessage]);

    return (
        <IconButton color="inherit">
            <Badge badgeContent={4} color="secondary">
                <NotificationsIcon/>
            </Badge>
        </IconButton>
    )
}

export default Notification;