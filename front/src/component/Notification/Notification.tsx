import {Badge, IconButton} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";


const Notification = () => {

    return (
        <IconButton color="inherit">
            <Badge badgeContent={4} color="secondary">
                <NotificationsIcon/>
            </Badge>
        </IconButton>
    )
}

export default Notification;