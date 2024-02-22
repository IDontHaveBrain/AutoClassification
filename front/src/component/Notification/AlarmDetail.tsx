import {Divider, List, ListItem, ListItemText} from "@mui/material";
import { AlarmModel } from "../../model/GlobalModel";
import { Fragment } from "react";

interface Props {
    handleClose: () => void;
    alarmList: AlarmModel[];
}

const AlarmDetail = ({handleClose, alarmList}: Props) => {

    return (
        <>
            <List sx={{minWidth: '300px', maxWdith: '400px', minHeight: '300px', maxHeight: '400px', overflow: 'auto'}}>
                {alarmList?.map((alarm, index) => (
                    <Fragment key={index}>
                        <ListItem>
                            <ListItemText primary={alarm.title} secondary={alarm.content}
                                          sx={{ textAlign: 'left' }}/>
                        </ListItem>
                        {index !== alarmList.length - 1 && <Divider />}
                    </Fragment>
                ))}
            </List>
        </>
    )
}

export default AlarmDetail;