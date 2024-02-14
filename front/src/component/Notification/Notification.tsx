import {Badge, IconButton} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SseClient from "../../service/SseClient";
import {useEffect} from "react";

interface Props {
    sseClient: SseClient;
}

const Notification = ({sseClient}: Props) => {


    useEffect(() => {

    }, [sseClient]);

    return (
        <IconButton color="inherit">
            <Badge badgeContent={4} color="secondary">
                <NotificationsIcon/>
            </Badge>
        </IconButton>
    )
}

export default Notification;