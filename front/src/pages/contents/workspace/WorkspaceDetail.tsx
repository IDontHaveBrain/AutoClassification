import { NoticeModel } from "model/GlobalModel";
import { useNavigate } from "react-router-dom";
import { Workspace } from "model/WorkspaceModel";
import {
  CardMedia,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { deleteWorkspace } from "service/Apis/WorkspaceApi";
import { onAlert } from "component/modal/AlertModal";
import { Strings } from "utils/strings";
import Button from "@mui/material/Button";

interface Props {
  data: Workspace;
  handleClose: () => void;
}

const WorkspaceDetail = ({ data, handleClose }: Props) => {
  const navigate = useNavigate();
  const handleEdit = () => {
    navigate("/workspace/editor", { state: { data } });
  };

  const handleDelete = () => {
    deleteWorkspace(data.id)
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
      <DialogTitle>{data.name}</DialogTitle>
      <DialogContent>
        <DialogContentText
          dangerouslySetInnerHTML={{ __html: data?.description || "" }}
        />
        {data.files?.map((file) => (
          <CardMedia
            component="img"
            height="140"
            image={file.url}
            alt={file.fileName}
            key={file.id}
          />
        ))}
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
export default WorkspaceDetail;
