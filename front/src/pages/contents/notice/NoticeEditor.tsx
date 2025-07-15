import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box,Paper, Typography } from '@mui/material';
import BaseTitle from 'component/baseBoard/BaseTitle';
import BaseEditor from 'component/baseEditor/BaseEditor';
import { addNotice, updateNotice } from 'service/Apis/NoticeApi';

import { onAlert } from 'utils/alert';
import { Strings } from 'utils/strings';

const NoticeEditor = () => {
  const [notice, setNotice] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const editorRef = useRef(null);
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

    if (isEdit) {
      updateNotice(notice.id, params)
          .then(() => {
            onAlert(Strings.Notice.update);
            navigate(-1);
          })
          .catch((_err) => {
            onAlert(Strings.Notice.updateFailed);
          });
    } else {
      addNotice(params)
          .then(() => {
            onAlert(Strings.Notice.add);
            navigate(-1);
          })
          .catch((_err) => {
            onAlert(Strings.Notice.addFailed);
          });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, m: 2, borderRadius: 2 }}>
      <BaseTitle title={isEdit ? '공지사항 수정' : '공지사항 작성'} />

      {/* Editor Section */}
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
          {isEdit ? 'Edit Notice' : 'Create New Notice'}
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
              defaultTitle={notice?.title}
              defaultContent={notice?.content}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default NoticeEditor;