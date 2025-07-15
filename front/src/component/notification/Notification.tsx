import { Badge, IconButton, Popover } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useCallback, useEffect, useState } from "react";
import { AlarmModel, SseType } from "model/GlobalModel";
import { getMyAlarms } from "service/Apis/AlarmApi";
import AlarmDetail from "component/notification/AlarmDetail";
import { eventBus } from "layouts/BackGround";

const POPOVER_ANCHOR_ORIGIN = {
    vertical: "bottom" as const,
    horizontal: "center" as const
};

const POPOVER_TRANSFORM_ORIGIN = {
    vertical: "top" as const,
    horizontal: "center" as const
};

const sortAlarms = (alarms: AlarmModel[]) =>
    alarms.sort((a, b) => b.id - a.id);

const Notification = () => {
    const [alarmList, setAlarmList] = useState<AlarmModel[]>([]);
    const [target, setTarget] = useState<HTMLElement | null>(null);
    const [open, setOpen] = useState(false);

    const fetchAlarm = useCallback(async () => {
        try {
            console.log("Fetching alarms...");
            const response = await getMyAlarms();
            console.log("Alarms fetched:", response.data);
            setAlarmList(sortAlarms([...response.data]));
        } catch (error) {
            console.error("Failed to fetch alarms:", error);
        }
    }, []);

    useEffect(() => {
        console.log("Notification component mounted");
        fetchAlarm();

        const handleAlarmUpdate = () => {
            console.log("Received alarm update in Notification component");
            fetchAlarm();
        };

        eventBus.subscribe(SseType.ALARM, handleAlarmUpdate);

        return () => {
            console.log("Notification component unmounting");
            eventBus.unsubscribe(SseType.ALARM, handleAlarmUpdate);
        };
    }, [fetchAlarm]);

    const handleOpenAlarmDetail = (event: React.MouseEvent<HTMLButtonElement>) => {
        setOpen(!open);
        setTarget(event.currentTarget);
    };

    const handleClose = () => {
        setOpen(false);
        fetchAlarm();
    };

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleOpenAlarmDetail}
                aria-label="알림"
            >
                <Badge badgeContent={alarmList.length} color="secondary">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Popover
                open={open}
                anchorEl={target}
                onClose={handleClose}
                anchorOrigin={POPOVER_ANCHOR_ORIGIN}
                transformOrigin={POPOVER_TRANSFORM_ORIGIN}
            >
                <AlarmDetail handleClose={handleClose} alarmList={alarmList} />
            </Popover>
        </>
    );
};

export default Notification;
