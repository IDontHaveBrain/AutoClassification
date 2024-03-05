import {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import { NoticeModel } from "../../../model/GlobalModel";
import { useNavigate } from "react-router-dom";
import { URLS } from "../../../utils/constant";
import { deleteNotice } from "../../../service/Apis/NoticeApi";
import { onAlert } from "../../../component/modal/AlertModal";

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
    console.log("delete");
    deleteNotice(data.id)
      .then((res) => {
        handleClose();
        onAlert("공지사항 삭제가 완료되었습니다.");
      })
      .catch((err) => {
        console.log(err);
        onAlert("공지사항 삭제에 실패했습니다.");
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
