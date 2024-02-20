import {Badge, IconButton, Popover} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SseClient from "../../service/commons/SseClient";
import {useEffect, useState} from "react";
import {useAppSelector} from "../../store/rootHook";
import {AlarmModel} from "../../model/AlarmModel";
import {getMyAlarms} from "../../service/AlarmApi";
import AlarmDetail from "./AlarmDetail";

interface Props {
    sse?: SseClient;
}

const Notification = () => {
    const [alarmList, setAlarmList] = useState<AlarmModel[]>([]);
    const [target, setTarget] = useState(null);
    const [open, setOpen] = useState(false);
    const newEvents = useAppSelector(state => state.sse.sseEvents);

    useEffect(() => {
        getMyAlarms().then((response) => {
            setAlarmList(prevAlarmList => [...prevAlarmList, ...response.data]);
        }).catch((error) => {
            console.error(error);
        });
    }, []);

    useEffect(() => {
        setAlarmList(prevAlarmList => {
            const combinedList = [...prevAlarmList, ...newEvents];
            const uniqueList = Array.from(new Set(combinedList.map(a => a.id)))
                .map(id => {
                    return combinedList.find(a => a.id === id)
                });
            return uniqueList;
        });
    }, [newEvents]);

    const handleDetail = (event) => {
        setOpen(!open);
        setTarget(event.currentTarget);
    }

    const handleClose = () => {
        setOpen(false);
    }

    return (<>
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
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <AlarmDetail handleClose={handleClose} alarmList={alarmList}/>
            </Popover>
        </>
    )
}

export default Notification;