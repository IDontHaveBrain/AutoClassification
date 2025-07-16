import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Divider, List, ListItemButton, ListItemText } from '@mui/material';
import { type AlarmModel } from 'model/GlobalModel';
import { readAlarm, readAllAlarm } from 'service/Apis/AlarmApi';

import { onAlert } from 'utils/alert';
import { Strings } from 'utils/strings';

interface Props {
    handleClose: () => void;
    alarmList: AlarmModel[];
}

const AlarmDetail = ({ handleClose, alarmList }: Props) => {
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
                // 오류를 조용히 처리
            });
    };

    const handleReadAll = () => {
        readAllAlarm()
            .then(() => {
                handleClose();
            })
            .catch((_error) => {
                onAlert(Strings.Common.apiFailed);
            });
    };

    return (
        <>
            <Button onClick={handleReadAll}>Mark all as read</Button>
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
