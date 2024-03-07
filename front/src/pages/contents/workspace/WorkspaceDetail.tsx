import { NoticeModel } from "model/GlobalModel";
import { useNavigate } from "react-router-dom";
import { Workspace } from "model/WorkspaceModel";
import { DialogContent, DialogContentText, DialogTitle } from "@mui/material";

interface Props {
  data: Workspace;
  handleClose: () => void;
}

const WorkspaceDetail = ({ data, handleClose }: Props) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate("/workspace/editor", { state: { data } });
  };

  const handleDelete = () => {};

  return (
    <>
      <DialogTitle>{data.name}</DialogTitle>
      <DialogContent>
        <DialogContentText
          dangerouslySetInnerHTML={{ __html: data?.description || "" }}
        />
      </DialogContent>
    </>
  );
};

export default WorkspaceDetail;