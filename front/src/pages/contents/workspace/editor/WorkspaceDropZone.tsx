import React, { useCallback, useState, useEffect } from "react";
import FileDropzone from "component/FileDropzone";
import { Avatar, Chip, LinearProgress, Typography, Box, Button } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandComp from "component/ExpandComp";
import { FileRejection } from "react-dropzone";

interface WorkspaceDropZoneProps {
    onFilesChange: (files: CustomFile[]) => void;
}

interface CustomFile extends File {
    preview: string;
}

const WorkspaceDropZone: React.FC<WorkspaceDropZoneProps> = ({ onFilesChange }) => {
    const [newFiles, setNewFiles] = useState<CustomFile[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    // Add cleanup effect to prevent memory leaks
    useEffect(() => {
        return () => {
            // Cleanup object URLs when component unmounts
            newFiles.forEach((file) => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, [newFiles]);

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            // Handle rejected files
            if (fileRejections.length > 0) {
                console.error("Rejected files:", fileRejections);
            }

            const updatedFiles = acceptedFiles.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                }) as CustomFile
            );

            setNewFiles((prevFiles) => {
                const combinedFiles = [...prevFiles, ...updatedFiles];
                onFilesChange(combinedFiles);
                return combinedFiles;
            });

            // Simulating upload progress
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
        [onFilesChange] // Remove 'newFiles' from dependencies
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
        // Cleanup all object URLs
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
                    'image/*': ['.jpeg', '.png', '.gif']
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
                            }
                        }} 
                    />
                </Box>
            )}
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {newFiles.map((file, index) => (
                    <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => handleRemoveFile(index)}
                        avatar={<Avatar alt={file.name} src={file.preview} />}
                        color={isValidFileType(file) ? "primary" : "error"}
                        sx={{ 
                            m: 0.5,
                            '& .MuiChip-avatar': {
                                width: 24,
                                height: 24,
                            }
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
