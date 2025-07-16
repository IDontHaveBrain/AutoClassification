import { type Accept, type FileRejection,useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('common');

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
          return <p>{t('fileUploadDisabled')}</p>;
        }
        if (isDragActive) {
          return <p>{t('dropImagesHere')}</p>;
        }
        return <p>{t('dragDropOrClick')}</p>;
      })()}
    </Box>
  );
};

export default FileDropzone;
