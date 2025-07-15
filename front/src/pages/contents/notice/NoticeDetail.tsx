import {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Button from "@mui/material/Button";
import { NoticeModel } from "model/GlobalModel";
import { useNavigate } from "react-router-dom";
import { deleteNotice } from "service/Apis/NoticeApi";
import { onAlert } from "component/modal/AlertModal";
import { Strings } from "utils/strings";

interface Props {
  data: NoticeModel;
  handleClose: () => void;
}

const NoticeDetail = ({ data, handleClose }: Props) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate("/notice/write", { state: { data } });
  };

  const handleDelete = () => {
    deleteNotice(data.id)
      .then((res) => {
        handleClose();
        onAlert(Strings.Common.apiSuccess);
      })
      .catch((err) => {
        console.log(err);
        onAlert(Strings.Common.apiFailed);
      });
  };

  return (
    <>
      <DialogTitle>{data.title}</DialogTitle>
      <DialogContent>
        <DialogContentText
          dangerouslySetInnerHTML={{ __html: data?.content || "" }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDelete}>삭제</Button>
        <Button onClick={handleEdit}>수정</Button>
        <Button onClick={handleClose} autoFocus>
          닫기
        </Button>
      </DialogActions>
    </>
  );
};

export default NoticeDetail;
