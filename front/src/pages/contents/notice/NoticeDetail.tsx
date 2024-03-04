import { DialogActions, DialogContent, DialogContentText, DialogTitle, useMediaQuery } from "@mui/material";
import Button from "@mui/material/Button";
import { useTheme } from '@mui/material/styles';
import { NoticeModel } from "../../../model/GlobalModel";
import { useNavigate } from "react-router-dom";
import { URLS } from "../../../utils/constant";

interface Props {
    data: NoticeModel;
    handleClose: () => void;
}

const NoticeDetail = ({data, handleClose}: Props) => {
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate('/notice/write', { state: { data } })
    }

    return (
        <>
            <DialogTitle>{data.title}</DialogTitle>
            <DialogContent>
                <DialogContentText dangerouslySetInnerHTML={{ __html: data?.content || '' }} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleEdit}>
                    수정
                </Button>
                <Button onClick={handleClose} autoFocus>
                    닫기
                </Button>
            </DialogActions>
        </>
    );
}

export default NoticeDetail;