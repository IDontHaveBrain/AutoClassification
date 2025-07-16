import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Divider, List, ListItemButton, ListItemText } from '@mui/material';
import { type AlarmModel } from 'model/GlobalModel';
import { readAlarm, readAllAlarm } from 'service/Apis/AlarmApi';

import { onAlert } from 'utils/alert';

interface Props {
    handleClose: () => void;
    alarmList: AlarmModel[];
}

const AlarmDetail = ({ handleClose, alarmList }: Props) => {
    const { t } = useTranslation('common');
    const { t: tApi } = useTranslation('api');
    const navigate = useNavigate();

    const handleAlarmClick = (alarm: AlarmModel) => {
        readAlarm(alarm.id)
            .then(() => {
                if (alarm.link) {
                    navigate(alarm.link);
                }
                handleClose();
            })
            .catch((_error) => {
                // 알람 읽기 실패 시 사용자 알림 없이 처리하여 UX 연속성 유지
            });
    };

    const handleReadAll = () => {
        readAllAlarm()
            .then(() => {
                handleClose();
            })
            .catch((_error) => {
                onAlert(tApi('requestFailed'));
            });
    };

    return (
        <>
            <Button onClick={handleReadAll}>{t('markAllAsRead')}</Button>
            <Divider />
            <List
                sx={{
                    minWidth: '300px',
                    maxWdith: '400px',
                    minHeight: '300px',
                    maxHeight: '400px',
                    overflow: 'auto',
                }}
            >
                {alarmList?.map((alarm, index) => (
                    <Fragment key={alarm.id}>
                        <ListItemButton onClick={() => handleAlarmClick(alarm)}>
                            <ListItemText
                                primary={alarm.title}
                                secondary={alarm.content}
                                sx={{ textAlign: 'left' }}
                            />
                        </ListItemButton>
                        {index !== alarmList.length - 1 && <Divider />}
                    </Fragment>
                ))}
            </List>
        </>
    );
};

export default AlarmDetail;
