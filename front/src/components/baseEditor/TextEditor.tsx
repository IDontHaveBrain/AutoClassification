import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, styled } from '@mui/material';
import { EditorContent,useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TextEditorProps {
    value?: string;
    onChange: (_content: string) => void;
}

// Quill Editor Snow 테마 스타일을 모방한 TipTap 에디터 컨테이너
const StyledEditorWrapper = styled(Box)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    minHeight: '150px',

    '& .tiptap': {
        padding: '12px 16px',
        minHeight: '120px',
        outline: 'none',
        fontSize: '14px',
        lineHeight: 1.5,

        '& p': {
            margin: '0 0 8px 0',
        },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
            fontWeight: 'bold',
            margin: '12px 0 8px 0',
        },
        '& h1': { fontSize: '2em' },
        '& h2': { fontSize: '1.5em' },
        '& h3': { fontSize: '1.3em' },

        '& ul, & ol': {
            paddingLeft: '24px',
            margin: '8px 0',
        },
        '& li': {
            margin: '4px 0',
        },

        '& blockquote': {
            borderLeft: `3px solid ${theme.palette.primary.main}`,
            paddingLeft: '16px',
            margin: '16px 0',
            fontStyle: 'italic',
            color: theme.palette.text.secondary,
        },
        '& pre': {
            backgroundColor: theme.palette.grey[100],
            padding: '12px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '13px',
        },
        '& code': {
            backgroundColor: theme.palette.grey[100],
            padding: '2px 4px',
            borderRadius: '3px',
            fontSize: '85%',
        },
        '& hr': {
            border: 'none',
            borderTop: `1px solid ${theme.palette.divider}`,
            margin: '16px 0',
        },

        '&:focus': {
            outline: 'none',
        },
    },

    '&:focus-within': {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    },
}));

// Quill Snow 테마와 유사한 디자인의 텍스트 포매팅 툴바
const ToolbarWrapper = styled(Box)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: '8px 12px',
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
    backgroundColor: theme.palette.grey[50],
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
}));

const ToolbarButton = styled('button')(({ theme }) => ({
    padding: '6px 8px',
    border: 'none',
    borderRadius: '3px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    minWidth: '28px',
    height: '28px',
    justifyContent: 'center',

    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },

    '&.is-active': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
}));

const TextEditor = ({ value, onChange }: TextEditorProps) => {
    const { t } = useTranslation();
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: 'tiptap',
            },
        },
    });

    // 외부 값 변경을 에디터와 동기화
    useEffect(() => {
        if (editor && value !== undefined) {
            const currentContent = editor.getHTML();
            if (currentContent !== value) {
                editor.commands.setContent(value);
            }
        }
    }, [editor, value]);

    if (!editor) {
        return null;
    }

    return (
        <StyledEditorWrapper>
            <ToolbarWrapper>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'is-active' : ''}
                    title={t('editor.bold')}
                >
                    <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'is-active' : ''}
                    title={t('editor.italic')}
                >
                    <em>I</em>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={editor.isActive('strike') ? 'is-active' : ''}
                    title={t('editor.strikethrough')}
                >
                    <s>S</s>
                </ToolbarButton>

                <Box sx={{ width: '1px', height: '20px', backgroundColor: 'divider', mx: 1 }} />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                    title={t('editor.heading1')}
                >
                    H1
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                    title={t('editor.heading2')}
                >
                    H2
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={editor.isActive('paragraph') ? 'is-active' : ''}
                    title={t('editor.paragraph')}
                >
                    P
                </ToolbarButton>

                <Box sx={{ width: '1px', height: '20px', backgroundColor: 'divider', mx: 1 }} />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'is-active' : ''}
                    title={t('editor.bulletList')}
                >
                    •
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'is-active' : ''}
                    title={t('editor.numberedList')}
                >
                    1.
                </ToolbarButton>

                <Box sx={{ width: '1px', height: '20px', backgroundColor: 'divider', mx: 1 }} />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={editor.isActive('blockquote') ? 'is-active' : ''}
                    title={t('editor.quote')}
                >
                    &quot;
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={editor.isActive('codeBlock') ? 'is-active' : ''}
                    title={t('editor.codeBlock')}
                >
                    {'</>'}
                </ToolbarButton>
            </ToolbarWrapper>

            <EditorContent editor={editor} />
        </StyledEditorWrapper>
    );
};

export default TextEditor;