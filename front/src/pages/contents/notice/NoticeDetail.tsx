import { useTranslation } from 'react-i18next';
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

interface Props {
  data: NoticeModel;
  handleClose: () => void;
}

const NoticeDetail = ({ data, handleClose }: Props) => {
  const { t } = useTranslation('notice');
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate('/notice/write', { state: { data } });
  };

  const handleDelete = () => {
    deleteNotice(data.id)
      .then(() => {
        handleClose();
        onAlert(t('messages.deleteSuccess'));
      })
      .catch((_err) => {
        onAlert(t('messages.deleteFailed'));
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
        <Button onClick={handleDelete}>{t('detail.deleteButton')}</Button>
        <Button onClick={handleEdit}>{t('detail.editButton')}</Button>
        <Button onClick={handleClose}>
          {t('detail.backToList')}
        </Button>
      </DialogActions>
    </>
  );
};

export default NoticeDetail;
