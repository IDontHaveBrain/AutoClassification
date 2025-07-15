import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box,Paper, Typography } from '@mui/material';
import { useTranslation } from 'hooks/useTranslation';
import { SseType } from 'model/GlobalModel';
import { addNotice, updateNotice } from 'service/Apis/NoticeApi';

import BaseTitle from 'components/baseBoard/BaseTitle';
import BaseEditor from 'components/baseEditor/BaseEditor';
import { onAlert } from 'utils/alert';
import { eventBus } from 'utils/eventBus';

interface EditorState {
  title: string;
  content: string;
}

interface ValidationErrors {
  title?: string;
  content?: string;
}

const NoticeEditor = () => {
  // Unified translation hooks
  const { t } = useTranslation('notice');
  const { t: tCommon } = useTranslation('common');

  const [notice, setNotice] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const editorRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.data) {
      setIsEdit(true);
      setNotice(location.state['data']);
    }
  }, [location]);

  // Simple form validation with i18n error messages
  const validateForm = (editorState: EditorState) => {
    const errors: ValidationErrors = {};

    // Basic validation
    if (!editorState.title || editorState.title.trim() === '') {
      errors.title = t('forms.required');
    }

    if (!editorState.content || editorState.content.trim() === '') {
      errors.content = t('forms.required');
    }

    // Additional validation with custom i18n messages
    if (editorState.title && editorState.title.length > 200) {
      errors.title = t('forms.titleTooLong');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!editorRef.current) return;
    const editorState = editorRef.current.getEditorState();

    // Form validation before submission
    if (!validateForm(editorState)) {
      onAlert(tCommon('messages.validationFailed'));
      return;
    }

    const params = {
      title: editorState.title,
      content: editorState.content,
    };

    if (isEdit) {
      updateNotice(notice.id, params)
          .then((response) => {
            // Publish event to trigger list refresh
            eventBus.publish(SseType.NOTICE, response.data);
            onAlert(t('messages.update'));
            navigate(-1);
          })
          .catch((error) => {
            // Simple error handling
            const errorMessage = error?.response?.data?.message || error?.message || t('messages.updateFailed');
            onAlert(errorMessage);
          });
    } else {
      addNotice(params)
          .then((response) => {
            // Publish event to trigger list refresh
            eventBus.publish(SseType.NOTICE, response.data);
            onAlert(t('messages.add'));
            navigate(-1);
          })
          .catch((error) => {
            // Simple error handling
            const errorMessage = error?.response?.data?.message || error?.message || t('messages.addFailed');
            onAlert(errorMessage);
          });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, m: 2, borderRadius: 2 }}>
      <BaseTitle title={isEdit ? t('general.editNotice') : t('general.createNotice')} />

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
          {isEdit ? t('general.editNotice') : t('general.createNotice')}
        </Typography>

        <Box sx={{
          border: '1px solid',
          borderColor: validationErrors.title || validationErrors.content ? 'error.main' : 'divider',
          borderRadius: 2,
          p: 3,
          backgroundColor: 'background.paper',
        }}>
          {(notice || !isEdit) && (
            <>
              {/* Display validation errors */}
              {Object.keys(validationErrors).length > 0 && (
                <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="error">
                    {tCommon('messages.validationErrors')}:
                  </Typography>
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <Typography key={field} variant="body2" color="error">
                      • {field}: {error as string}
                    </Typography>
                  ))}
                </Box>
              )}

              <BaseEditor
                ref={editorRef}
                handleSave={handleSave}
                defaultTitle={notice?.title}
                defaultContent={notice?.content}
              />
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default NoticeEditor;