import { type Accept, type FileRejection,useDropzone } from 'react-dropzone';
import Box from '@mui/material/Box';

interface Props {
  onDrop: (_acceptedFiles: File[], _fileRejections: FileRejection[]) => void;
  accept?: Accept;
  style?: React.CSSProperties;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
}

const FileDropzone = ({
  onDrop,
  accept,
  style,
  maxSize,
  maxFiles,
  multiple = true,
  disabled = false,
}: Props) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    multiple,
    disabled,
  });

  return (
    <Box
      {...getRootProps()}
      border={2}
      style={{
        borderStyle: 'dashed',
        padding: '20px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        backgroundColor: disabled ? '#f5f5f5' : 'transparent',
        ...style,
      }}
    >
      <input {...getInputProps()} />
      {(() => {
        if (disabled) {
          return <p>파일 업로드가 비활성화되었습니다.</p>;
        }
        if (isDragActive) {
          return <p>Drop the imgs or zip here...</p>;
        }
        return <p>Drag & drop some imgs or zip here, or click to select imgs</p>;
      })()}
    </Box>
  );
};

export default FileDropzone;
