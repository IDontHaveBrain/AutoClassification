import {Badge, IconButton, Popover} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SseClient from "service/commons/SseClient";
import {useCallback, useEffect, useState} from "react";
import {AlarmModel} from "model/GlobalModel";
import {useAppSelector} from "stores/rootHook";
import {getMyAlarms} from "service/Apis/AlarmApi";
import AlarmDetail from "component/notification/AlarmDetail";

interface Props {
    sse?: SseClient;
}

const Notification = () => {
    const [alarmList, setAlarmList] = useState<AlarmModel[]>([]);
    const [target, setTarget] = useState(null);
    const [open, setOpen] = useState(false);
    const newEvents = useAppSelector((state) => state.sse.sseEvents);

    const fetchAlarm = useCallback(async () => {
        getMyAlarms()
            .then((response) => {
                const sortedData = [...response.data].sort(
                    (a, b) => new Date(b.createDateTime).getTime() - new Date(a.createDateTime).getTime()
                );
                setAlarmList(sortedData);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [setAlarmList]);

    useEffect(() => {
        fetchAlarm();
    }, [fetchAlarm]);

    useEffect(() => {
        setAlarmList((prevAlarmList) => {
            const combinedList = [...prevAlarmList, ...newEvents];
            const uniqueList = Array.from(new Set(combinedList.map((a) => a.id))).map(
                (id) => {
                    return combinedList.find((a) => a.id === id);
                },
            );
            return uniqueList;
        });
    }, [newEvents]);

    const handleDetail = (event) => {
        setOpen(!open);
        setTarget(event.currentTarget);
    };

    const handleClose = () => {
        setOpen(false);
        fetchAlarm();
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleDetail}>
                <Badge badgeContent={alarmList.length} color="secondary">
                    <NotificationsIcon/>
                </Badge>
            </IconButton>
            <Popover
                open={open}
                anchorEl={target}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
            >
                <AlarmDetail handleClose={handleClose} alarmList={alarmList}/>
            </Popover>
        </>
    );
};

export default Notification;
