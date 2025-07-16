import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box,Paper, Typography } from '@mui/material';
import { type NoticeModel } from 'model/GlobalModel';
import { addNotice, updateNotice } from 'service/Apis/NoticeApi';

import BaseTitle from 'components/baseBoard/BaseTitle';
import BaseEditor from 'components/baseEditor/BaseEditor';
import { onAlert } from 'utils/alert';

interface EditorHandle {
  getEditorState: () => { title: string; content: string };
}

const NoticeEditor = () => {
  const { t } = useTranslation('notice');
  const [notice, setNotice] = useState<NoticeModel | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const editorRef = useRef<EditorHandle>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.data) {
      setIsEdit(true);
      setNotice(location.state['data']);
    }
  }, [location]);

  const handleSave = () => {
    if (!editorRef.current) return;
    const editorState = editorRef.current.getEditorState();

    const params = {
      title: editorState.title,
      content: editorState.content,
    };

    if (isEdit && notice) {
      updateNotice(notice.id, params)
          .then(() => {
            onAlert(t('messages.updateSuccess'));
            navigate(-1);
          })
          .catch((_err) => {
            onAlert(t('messages.updateFailed'));
          });
    } else {
      addNotice(params)
          .then(() => {
            onAlert(t('messages.createSuccess'));
            navigate(-1);
          })
          .catch((_err) => {
            onAlert(t('messages.createFailed'));
          });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, m: 2, borderRadius: 2 }}>
      <BaseTitle title={isEdit ? t('editor.editTitle') : t('editor.title')} />

      <Box sx={{ mt: 4 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 3,
          }}
        >
          {isEdit ? t('editor.editTitle') : t('editor.title')}
        </Typography>

        <Box sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 3,
          backgroundColor: 'background.paper',
        }}>
          {(notice || !isEdit) && (
            <BaseEditor
              ref={editorRef}
              handleSave={handleSave}
              defaultTitle={notice?.title || ''}
              defaultContent={notice?.content || ''}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default NoticeEditor;