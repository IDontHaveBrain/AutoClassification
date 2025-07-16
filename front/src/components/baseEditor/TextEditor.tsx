import { useEffect } from 'react';
import { Box, styled } from '@mui/material';
import { EditorContent,useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TextEditorProps {
    value?: string;
    onChange: (_content: string) => void;
}

// Quill snow 테마 모양을 모방한 스타일 래퍼
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

        // 기본 텍스트 서식
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

        // 목록
        '& ul, & ol': {
            paddingLeft: '24px',
            margin: '8px 0',
        },
        '& li': {
            margin: '4px 0',
        },

        // 기타 서식
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

        // 포커스 상태
        '&:focus': {
            outline: 'none',
        },
    },

    // 래퍼 포커스 상태
    '&:focus-within': {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    },
}));

// 기본 서식 옵션이 있는 툴바 (Quill snow 테마와 유사)
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
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // 포함할 확장 기능 구성
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
                    title="Bold"
                >
                    <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'is-active' : ''}
                    title="Italic"
                >
                    <em>I</em>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={editor.isActive('strike') ? 'is-active' : ''}
                    title="Strikethrough"
                >
                    <s>S</s>
                </ToolbarButton>

                <Box sx={{ width: '1px', height: '20px', backgroundColor: 'divider', mx: 1 }} />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                    title="Heading 1"
                >
                    H1
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                    title="Heading 2"
                >
                    H2
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={editor.isActive('paragraph') ? 'is-active' : ''}
                    title="Paragraph"
                >
                    P
                </ToolbarButton>

                <Box sx={{ width: '1px', height: '20px', backgroundColor: 'divider', mx: 1 }} />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'is-active' : ''}
                    title="Bullet List"
                >
                    •
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'is-active' : ''}
                    title="Numbered List"
                >
                    1.
                </ToolbarButton>

                <Box sx={{ width: '1px', height: '20px', backgroundColor: 'divider', mx: 1 }} />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={editor.isActive('blockquote') ? 'is-active' : ''}
                    title="Quote"
                >
                    &quot;
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={editor.isActive('codeBlock') ? 'is-active' : ''}
                    title="Code Block"
                >
                    {'</>'}
                </ToolbarButton>
            </ToolbarWrapper>

            <EditorContent editor={editor} />
        </StyledEditorWrapper>
    );
};

export default TextEditor;