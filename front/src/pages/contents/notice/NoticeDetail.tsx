import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import Button from '@mui/material/Button';
import { useTranslation } from 'hooks/useTranslation';
import { type NoticeModel, SseType } from 'model/GlobalModel';
import { deleteNotice } from 'service/Apis/NoticeApi';

import { onAlert } from 'utils/alert';
import { eventBus } from 'utils/eventBus';

interface Props {
  data: NoticeModel;
  handleClose: () => void;
}

const NoticeDetail = ({ data, handleClose }: Props) => {
  const navigate = useNavigate();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // Translation hooks
  const { t: noticeT } = useTranslation('notice');
  const { t: commonT } = useTranslation('common');

  const handleEdit = () => {
    navigate('/notice/write', { state: { data } });
  };

  const handleDelete = () => {
    setOpenConfirmDialog(true);
  };

  const confirmDelete = () => {
    setOpenConfirmDialog(false);
    deleteNotice(data.id)
      .then(() => {
        handleClose();
        // Publish event to trigger list refresh
        eventBus.publish(SseType.NOTICE, data);
        onAlert(noticeT('messages.deleteSuccess'));
      })
      .catch((_err) => {
        onAlert(noticeT('messages.deleteFailed'));
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
        <Button onClick={handleDelete}>{noticeT('actions.delete')}</Button>
        <Button onClick={handleEdit}>{noticeT('actions.update')}</Button>
        <Button onClick={handleClose}>
          {commonT('buttons.close')}
        </Button>
      </DialogActions>
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{noticeT('messages.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {noticeT('messages.deleteConfirm')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
            {commonT('buttons.cancel')}
          </Button>
          <Button onClick={confirmDelete} color="primary">
            {noticeT('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NoticeDetail;
