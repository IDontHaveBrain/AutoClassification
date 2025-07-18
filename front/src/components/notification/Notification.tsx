import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge, IconButton, Popover } from '@mui/material';
import { type AlarmModel, SseType } from 'model/GlobalModel';
import { getMyAlarms } from 'service/Apis/AlarmApi';

import AlarmDetail from 'components/notification/AlarmDetail';
import { eventBus } from 'utils/eventBus';

const POPOVER_ANCHOR_ORIGIN = {
    vertical: 'bottom' as const,
    horizontal: 'center' as const,
};

const POPOVER_TRANSFORM_ORIGIN = {
    vertical: 'top' as const,
    horizontal: 'center' as const,
};

const sortAlarms = (alarms: AlarmModel[]) =>
    alarms.sort((a, b) => b.id - a.id);

const Notification = () => {
    const { t } = useTranslation('common');
    const [alarmList, setAlarmList] = useState<AlarmModel[]>([]);
    const [target, setTarget] = useState<HTMLElement | null>(null);
    const [open, setOpen] = useState(false);

    const fetchAlarm = useCallback(async () => {
        try {
            const response = await getMyAlarms();
            setAlarmList(sortAlarms([...response.data]));
        } catch (_error) {
            // 알람 목록 조회 실패 시 사용자 알림 없이 처리하여 UX 연속성 유지
        }
    }, []);

    useEffect(() => {
        fetchAlarm();

        const handleAlarmUpdate = () => {
            fetchAlarm();
        };

        eventBus.subscribe(SseType.ALARM, handleAlarmUpdate);

        return () => {
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
                aria-label={t('alert')}
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
