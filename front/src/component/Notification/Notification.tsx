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

    return (
        <IconButton color="inherit">
            <Badge badgeContent={4} color="secondary">
                <NotificationsIcon/>
            </Badge>
        </IconButton>
    )
}

export default Notification;