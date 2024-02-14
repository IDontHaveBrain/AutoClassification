import {Badge, IconButton} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SseClient from "../../service/SseClient";
import {useEffect} from "react";
import {URLS} from "../../utils/constant";

interface Props {
    sseClient: SseClient;
}

const Notification = ({sseClient}: Props) => {

    const handleSseMessage = (event: MessageEvent) => {
        console.log(event);
    }

    const handleSseError = (event: Event) => {
        console.log(event);

    }

    useEffect(() => {
        sseClient.connect(URLS.API.SSE.SUBSCRIBE, handleSseMessage, handleSseError);
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