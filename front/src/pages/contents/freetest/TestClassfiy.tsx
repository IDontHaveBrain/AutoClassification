import React, { useCallback, useEffect, useId,useState } from 'react';
import { type FileRejection } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    Alert,
    CircularProgress,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { testUploadImg } from 'service/Apis/TrainApi';

import ClassInputCard from 'components/ClassInputCard';
import FileDropzone from 'components/FileDropzone';
import { onAlert } from 'utils/alert';

const TEST_MAX_CLASSES_COUNT = 5;
const TEST_MIN_CLASSES_COUNT = 2;

interface CustomFile extends File {
    preview: string;
}

const TestClassify: React.FC = () => {
    const { t } = useTranslation('test');
    const idPrefix = useId();
    const [files, setFiles] = useState<CustomFile[]>([]);
    const [classList, setClassList] = useState<string[]>(['', '']);

    // 컴포넌트 언마운트 시 URL 객체 메모리 누수 방지를 위한 정리
    useEffect(() => {
        return () => {
            files.forEach((file) => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, [files]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const addClass = () => {
        if (classList.length < TEST_MAX_CLASSES_COUNT) {
            setClassList([...classList, '']);
        } else {
            onAlert(t('classify.maxClassCountError', { max: TEST_MAX_CLASSES_COUNT }));
        }
    };

    const handleInputChange = (index: number, newValue: string) => {
        const newClassList = [...classList];
        newClassList[index] = newValue;
        setClassList(newClassList);
    };

    const removeClass = (index: number) => {
        if (classList.length <= TEST_MIN_CLASSES_COUNT) {
            onAlert(t('classify.minClassCountError', { min: TEST_MIN_CLASSES_COUNT }));
        } else {
            const newClassList = classList.filter((_, i) => i !== index);
            setClassList(newClassList);
        }
    };

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            if (fileRejections.length > 0) {
                const rejectionReasons = fileRejections.map(rejection => {
                    const errors = rejection.errors.map(error => {
                        switch (error.code) {
                            case 'file-invalid-type':
                                return t('classify.unsupportedFileType');
                            case 'file-too-large':
                                return t('classify.fileTooLarge');
                            case 'too-many-files':
                                return t('classify.tooManyFiles');
                            default:
                                return t('classify.fileUploadError');
                        }
                    }).join(', ');
                    return `${rejection.file.name}: ${errors}`;
                }).join('\n');

                onAlert(`${t('classify.uploadFailure')}\n${rejectionReasons}`);
                return;
            }

            if (files.length + acceptedFiles.length > 30) {
                onAlert(t('classify.maxImageLimit'));
                return;
            }

            const processedFiles = acceptedFiles.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                }) as CustomFile,
            );

            setFiles(prevFiles => [...prevFiles, ...processedFiles]);
            setApiError(null);
        },
        [files, t],
    );

    const validCheck = (): boolean => {
        if (classList.some(item => item.trim() === '')) {
            onAlert(t('api.notEmpty'));
            return false;
        }

        if (files.length === 0) {
            onAlert(t('classify.selectImagesFirst'));
            return false;
        }

        if (files.length > 30) {
            onAlert(t('classify.maxImageLimit'));
            return false;
        }

        return true;
    };

    const onSave = async () => {
        if (!validCheck()) return;

        setIsLoading(true);
        setApiError(null);

        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('files', file);
            });
            formData.append('data', new Blob([JSON.stringify(classList)], { type: 'application/json' }));

            await testUploadImg(formData);

            setClassList(['', '']);
            files.forEach((file) => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
            setFiles([]);
            onAlert(t('classify.requestTest'));

        } catch (error: unknown) {
            let errorMessage = t('classify.testRequestFailed');

            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as {
                    response?: {
                        status: number;
                        data?: { message?: string }
                    };
                    code?: string;
                    message?: string;
                };

                if (axiosError.response) {
                    const { status } = axiosError.response;
                    const { data } = axiosError.response;

                switch (status) {
                    case 400:
                        errorMessage = data?.message || t('classify.invalidRequest');
                        break;
                    case 401:
                        errorMessage = t('classify.authExpired');
                        break;
                    case 403:
                        errorMessage = t('classify.accessDenied');
                        break;
                    case 413:
                        errorMessage = t('classify.fileSizeExceeded');
                        break;
                    case 422:
                        errorMessage = data?.message || t('classify.invalidDataFormat');
                        break;
                    case 500:
                        errorMessage = t('classify.serverError');
                        break;
                    case 503:
                        errorMessage = t('classify.serviceUnavailable');
                        break;
                    default:
                        errorMessage = data?.message || t('classify.serverErrorStatus', { status });
                }
                } else if (axiosError.code === 'NETWORK_ERROR' || (axiosError.message && axiosError.message.includes('Network Error'))) {
                    errorMessage = t('classify.networkError');
                } else if (axiosError.code === 'ECONNABORTED' || (axiosError.message && axiosError.message.includes('timeout'))) {
                    errorMessage = t('classify.requestTimeout');
                } else if (axiosError.message) {
                    errorMessage = axiosError.message;
                }
            }

            setApiError(errorMessage);
            onAlert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const onRemove = (index: number) => {
        const fileToRemove = files[index];
        if (fileToRemove?.preview) {
            URL.revokeObjectURL(fileToRemove.preview);
        }
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
    };

    const onRemoveAll = () => {
        files.forEach((file) => {
            if (file.preview) {
                URL.revokeObjectURL(file.preview);
            }
        });
        setFiles([]);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" gutterBottom>{t('classify.classInput')}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {classList.map((item, index) => {
                            // 빈 값과 중복 클래스에 대한 안정적인 React 키 생성 로직
                            const baseKey = item.trim() || 'empty';
                            const existingKeys = classList.slice(0, index).filter(prevItem =>
                                (prevItem.trim() || 'empty') === baseKey,
                            ).length;
                            const stableKey = `${idPrefix}-class-${baseKey}${existingKeys > 0 ? `-${existingKeys}` : ''}`;
                            return (
                                <ClassInputCard
                                    key={stableKey}
                                    value={item}
                                    onChange={(newValue) => handleInputChange(index, newValue)}
                                    onDelete={() => removeClass(index)}
                                    isRequired={index < TEST_MIN_CLASSES_COUNT}
                                />
                            );
                        })}
                        {classList.length < TEST_MAX_CLASSES_COUNT && (
                            <IconButton onClick={addClass} color="primary">
                                <AddCircleOutlineIcon />
                            </IconButton>
                        )}
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" gutterBottom>{t('classify.fileUpload')}</Typography>
                    <FileDropzone
                        onDrop={onDrop}
                        accept={{
                            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
                        }}
                        maxSize={5 * 1024 * 1024}
                        maxFiles={30}
                        disabled={isLoading}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Box>
                            <Typography variant="subtitle1">{t('classify.uploadedImages')}: {files.length} / 30</Typography>
                            {files.length > 0 && (
                                <Typography variant="caption" color="textSecondary">
                                    {t('classify.totalSize', { size: (files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(1) })}
                                </Typography>
                            )}
                        </Box>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={onRemoveAll}
                            disabled={files.length === 0 || isLoading}
                        >
                            {t('classify.deleteAllImages')}
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                        {files.map((file, index) => (
                            <Box key={`${file.name}-${file.size}-${file.lastModified}`} sx={{ position: 'relative' }}>
                                <img src={file.preview} style={{ width: '100px', height: '100px', objectFit: 'cover' }} alt="preview" />
                                <IconButton
                                    size="small"
                                    onClick={() => onRemove(index)}
                                    disabled={isLoading}
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                                        '&:disabled': {
                                            bgcolor: 'rgba(200, 200, 200, 0.7)',
                                            color: 'rgba(0, 0, 0, 0.3)',
                                        },
                                    }}
                                >
                                    X
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>

            {isLoading && (
                <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" ml={1}>
                        {t('classify.classifyProcessing')}
                    </Typography>
                </Box>
            )}

            {apiError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {apiError}
                </Alert>
            )}

            <Button
                onClick={onSave}
                color="secondary"
                variant="contained"
                sx={{ alignSelf: 'flex-start' }}
                disabled={isLoading || files.length === 0}
                startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
            >
                {isLoading ? t('classify.processing') : t('classify.classifyTest')}
            </Button>
            <Divider />
            <List>
                {files.map((file) => (
                    <ListItem key={`list-${file.name}-${file.size}-${file.lastModified}`}>
                        <ListItemText primary={file.name} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default TestClassify;
