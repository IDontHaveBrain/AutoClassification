import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Box,Divider } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextEditor from 'component/baseEditor/TextEditor';
import BaseInputField from 'component/BaseInputField';

interface Props {
    handleSave: () => void;
    defaultTitle: string;
    defaultContent: string;
}

const BaseEditor = ({ handleSave, defaultTitle, defaultContent }: Props, ref) => {
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
            {/* 제목 및 저장 섹션 */}
            <Grid container spacing={3} alignItems="end" sx={{ mb: 3 }}>
                <Grid item xs={12} sm={9} md={10}>
                    <BaseInputField
                        label="Title : "
                        value={editorTitle}
                        onChange={(e) => setEditorTitle(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={3} md={2}>
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
                        Save
                    </Button>
                </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            {/* 콘텐츠 에디터 섹션 */}
            <Box sx={{ mt: 3 }}>
                <TextEditor value={editorContent} onChange={setEditorContent} />
            </Box>
        </Box>
    );
};

export default forwardRef(BaseEditor);