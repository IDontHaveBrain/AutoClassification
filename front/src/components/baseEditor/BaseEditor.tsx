import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box,Divider } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

import TextEditor from 'components/baseEditor/TextEditor';
import BaseInputField from 'components/BaseInputField';

interface Props {
    handleSave: () => void;
    defaultTitle: string;
    defaultContent: string;
}

const BaseEditor = ({ handleSave, defaultTitle, defaultContent }: Props, ref: React.Ref<{ getEditorState: () => { title: string; content: string } }>) => {
    const { t } = useTranslation('common');
    const [editorTitle, setEditorTitle] = useState(defaultTitle);
    const [editorContent, setEditorContent] = useState(defaultContent);

    useEffect(() => {
        setEditorTitle(defaultTitle);
        setEditorContent(defaultContent);
    }, [defaultTitle, defaultContent]);

    useImperativeHandle(ref, () => ({
        getEditorState: () => ({ title: editorTitle, content: editorContent }),
    }));

    return (
        <Box>
            <Grid container spacing={3} alignItems="end" sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 9, md: 10 }}>
                    <BaseInputField
                        label={`${t('title')} : `}
                        value={editorTitle}
                        onChange={(e) => setEditorTitle(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleSave}
                        fullWidth
                        size="large"
                        sx={{
                            height: 56,
                            borderRadius: 2,
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            boxShadow: 2,
                            '&:hover': {
                                boxShadow: 4,
                                transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        {t('save')}
                    </Button>
                </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mt: 3 }}>
                <TextEditor value={editorContent} onChange={setEditorContent} />
            </Box>
        </Box>
    );
};

export default forwardRef(BaseEditor);