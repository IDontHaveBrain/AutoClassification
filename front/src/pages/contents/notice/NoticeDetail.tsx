import { useNavigate } from 'react-router-dom';
import {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import Button from '@mui/material/Button';
import { type NoticeModel } from 'model/GlobalModel';
import { deleteNotice } from 'service/Apis/NoticeApi';

import { onAlert } from 'utils/alert';
import { Strings } from 'utils/strings';

interface Props {
  data: NoticeModel;
  handleClose: () => void;
}

const NoticeDetail = ({ data, handleClose }: Props) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate('/notice/write', { state: { data } });
  };

  const handleDelete = () => {
    deleteNotice(data.id)
      .then(() => {
        handleClose();
        onAlert(Strings.Common.apiSuccess);
      })
      .catch((_err) => {
        onAlert(Strings.Common.apiFailed);
      });
  };

  return (
    <>
      <DialogTitle>{data.title}</DialogTitle>
      <DialogContent>
        <DialogContentText
          dangerouslySetInnerHTML={{ __html: data?.content || '' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDelete}>삭제</Button>
        <Button onClick={handleEdit}>수정</Button>
        <Button onClick={handleClose}>
          닫기
        </Button>
      </DialogActions>
    </>
  );
};

export default NoticeDetail;
