import { DialogActions, DialogContent, DialogContentText, DialogTitle, useMediaQuery } from "@mui/material";
import Button from "@mui/material/Button";
import { useTheme } from '@mui/material/styles';
import { NoticeModel } from "../../../model/GlobalModel";

interface Props {
    data: NoticeModel;
    handleClose: () => void;
}

const NoticeDetail = ({data, handleClose}: Props) => {

    return (
        <>
            <DialogTitle>{data.title}</DialogTitle>
            <DialogContent>
                <DialogContentText dangerouslySetInnerHTML={{ __html: data?.content || '' }} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} autoFocus>
                    닫기
                </Button>
            </DialogActions>
        </>
    );
}

export default NoticeDetail;