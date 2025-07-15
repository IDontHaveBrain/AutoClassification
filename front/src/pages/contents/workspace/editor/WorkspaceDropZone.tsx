import React, { useCallback, useEffect,useState } from 'react';
import { type FileRejection } from 'react-dropzone';
import DeleteIcon from '@mui/icons-material/Delete';
import { Avatar, Box, Button,Chip, LinearProgress, Typography } from '@mui/material';
import ExpandComp from 'component/ExpandComp';
import FileDropzone from 'component/FileDropzone';

interface WorkspaceDropZoneProps {
    onFilesChange: (_files: CustomFile[]) => void;
}

interface CustomFile extends File {
    preview: string;
}

const WorkspaceDropZone: React.FC<WorkspaceDropZoneProps> = ({ onFilesChange }) => {
    const [newFiles, setNewFiles] = useState<CustomFile[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    // 컴포넌트 언마운트 시 메모리 누수를 방지하기 위한 정리 작업
    useEffect(() => {
        return () => {
            newFiles.forEach((file) => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, [newFiles]);

    const onDrop = useCallback(
        (acceptedFiles: File[], _fileRejections: FileRejection[]) => {
            if (_fileRejections.length > 0) {
                // 거부된 파일 조용히 처리
            }

            const updatedFiles = acceptedFiles.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                }) as CustomFile,
            );

            setNewFiles((prevFiles) => {
                const combinedFiles = [...prevFiles, ...updatedFiles];
                onFilesChange(combinedFiles);
                return combinedFiles;
            });

            // 업로드 진행률 시뮬레이션
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                setUploadProgress(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setUploadProgress(0), 1000);
                }
            }, 200);
        },
        [onFilesChange],
    );

    const handleRemoveFile = (index: number) => {
        const fileToRemove = newFiles[index];
        if (fileToRemove?.preview) {
            URL.revokeObjectURL(fileToRemove.preview);
        }
        const updatedFiles = newFiles.filter((_, i) => i !== index);
        setNewFiles(updatedFiles);
        onFilesChange(updatedFiles);
    };

    const handleClearAll = () => {
        newFiles.forEach((file) => {
            if (file.preview) {
                URL.revokeObjectURL(file.preview);
            }
        });
        setNewFiles([]);
        onFilesChange([]);
    };

    const isValidFileType = (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        return allowedTypes.includes(file.type);
    };

    return (
        <ExpandComp title="Add Images">
            <FileDropzone
                onDrop={onDrop}
                accept={{
                    'image/*': ['.jpeg', '.png', '.gif'],
                }}
            />
            {uploadProgress > 0 && (
                <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress
                        variant="determinate"
                        value={uploadProgress}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 5,
                            },
                        }}
                    />
                </Box>
            )}
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {newFiles.map((file, index) => (
                    <Chip
                        key={`${file.name}-${file.size}-${file.lastModified}`}
                        label={file.name}
                        onDelete={() => handleRemoveFile(index)}
                        avatar={<Avatar alt={file.name} src={file.preview} />}
                        color={isValidFileType(file) ? 'primary' : 'error'}
                        sx={{
                            m: 0.5,
                            '& .MuiChip-avatar': {
                                width: 24,
                                height: 24,
                            },
                        }}
                    />
                ))}
            </Box>
            {newFiles.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleClearAll}
                    >
                        Clear All
                    </Button>
                </Box>
            )}
            <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                Allowed file types: JPEG, PNG, GIF. Max size: 5MB
            </Typography>
        </ExpandComp>
    );
};

export default WorkspaceDropZone;
