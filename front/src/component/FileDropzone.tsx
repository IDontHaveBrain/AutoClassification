import { Accept, useDropzone, FileRejection } from "react-dropzone";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useCallback, useRef } from "react";

interface Props {
  onDrop: (acceptedFiles: File[], fileRejections: FileRejection[]) => void;
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
  disabled = false 
}: Props) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    multiple,
    disabled,
  });

  const playwrightFileInputRef = useRef<HTMLInputElement>(null);

  const handlePlaywrightFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      onDrop(fileArray, []);
    }
  }, [onDrop]);

  const handlePlaywrightButtonClick = useCallback(() => {
    if (playwrightFileInputRef.current) {
      playwrightFileInputRef.current.click();
    }
  }, []);

  return (
    <Box>
      <Box
        {...getRootProps()}
        border={2}
        style={{ 
          borderStyle: "dashed", 
          padding: "20px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          backgroundColor: disabled ? "#f5f5f5" : "transparent",
          ...style 
        }}
      >
        <input {...getInputProps()} />
        {disabled ? (
          <p>파일 업로드가 비활성화되었습니다.</p>
        ) : isDragActive ? (
          <p>Drop the imgs or zip here...</p>
        ) : (
          <p>Drag & drop some imgs or zip here, or click to select imgs</p>
        )}
      </Box>
      
      {/* Playwright-compatible file upload button */}
      <Box mt={2}>
        <input
          ref={playwrightFileInputRef}
          type="file"
          multiple={multiple}
          accept={accept ? Object.keys(accept).join(',') : undefined}
          onChange={handlePlaywrightFileUpload}
          style={{ display: 'none' }}
          data-testid="file-upload-input"
          disabled={disabled}
        />
        <Button
          variant="outlined"
          onClick={handlePlaywrightButtonClick}
          disabled={disabled}
          data-testid="file-upload-button"
        >
          Browse Files (Test Upload)
        </Button>
      </Box>
    </Box>
  );
};

export default FileDropzone;
