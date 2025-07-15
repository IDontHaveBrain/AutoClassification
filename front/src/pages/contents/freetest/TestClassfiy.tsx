import React, { useCallback, useEffect, useId,useState } from 'react';
import { type FileRejection } from 'react-dropzone';
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
import ClassInputCard from 'component/ClassInputCard';
import FileDropzone from 'component/FileDropzone';
import { testUploadImg } from 'service/Apis/TrainApi';

import { onAlert } from 'utils/alert';
import { Strings } from 'utils/strings';

const TEST_MAX_CLASSES_COUNT = 5;
const TEST_MIN_CLASSES_COUNT = 2;

interface CustomFile extends File {
    preview: string;
}

const TestClassify: React.FC = () => {
    const idPrefix = useId();
    const [files, setFiles] = useState<CustomFile[]>([]);
    const [classList, setClassList] = useState<string[]>(['', '']);

    // 컴포넌트 언마운트 시 메모리 누수를 방지하기 위한 정리 작업
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
            onAlert(`최대 ${TEST_MAX_CLASSES_COUNT}개의 클래스만 추가할 수 있습니다.`);
        }
    };

    const handleInputChange = (index: number, newValue: string) => {
        const newClassList = [...classList];
        newClassList[index] = newValue;
        setClassList(newClassList);
    };

    const removeClass = (index: number) => {
        if (classList.length <= TEST_MIN_CLASSES_COUNT) {
            onAlert(`최소 ${TEST_MIN_CLASSES_COUNT}개의 클래스를 유지해야 합니다.`);
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
                                return '지원되지 않는 파일 형식입니다. (JPEG, PNG, GIF만 지원)';
                            case 'file-too-large':
                                return '파일 크기가 너무 큽니다. (최대 5MB)';
                            case 'too-many-files':
                                return '파일 개수가 너무 많습니다.';
                            default:
                                return '파일 업로드 중 오류가 발생했습니다.';
                        }
                    }).join(', ');
                    return `${rejection.file.name}: ${errors}`;
                }).join('\n');

                onAlert(`파일 업로드 실패:\n${rejectionReasons}`);
                return;
            }

            if (files.length + acceptedFiles.length > 30) {
                onAlert('분류 테스트는 이미지 30개 이하로 테스트 가능합니다.');
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
        [files],
    );

    const validCheck = (): boolean => {
        if (classList.some(item => item.trim() === '')) {
            onAlert(Strings.Common.notEmpty);
            return false;
        }

        if (files.length === 0) {
            onAlert('분류할 이미지를 업로드해주세요.');
            return false;
        }

        if (files.length > 30) {
            onAlert('분류 테스트는 이미지 30개 이하로 테스트 가능합니다.');
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
            onAlert(Strings.FreeTest.requestTest);

        } catch (error: unknown) {
            let errorMessage = '분류 테스트 요청이 실패했습니다.';

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
                        errorMessage = data?.message || '잘못된 요청입니다. 입력 데이터를 확인해주세요.';
                        break;
                    case 401:
                        errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
                        break;
                    case 403:
                        errorMessage = '접근 권한이 없습니다.';
                        break;
                    case 413:
                        errorMessage = '업로드 파일 크기가 너무 큽니다.';
                        break;
                    case 422:
                        errorMessage = data?.message || '파일 형식이나 데이터가 올바르지 않습니다.';
                        break;
                    case 500:
                        errorMessage = '서버 내부 오류입니다. 잠시 후 다시 시도해주세요.';
                        break;
                    case 503:
                        errorMessage = 'AI 서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
                        break;
                    default:
                        errorMessage = data?.message || `서버 오류 (${status})`;
                }
                } else if (axiosError.code === 'NETWORK_ERROR' || (axiosError.message && axiosError.message.includes('Network Error'))) {
                    errorMessage = '네트워크 연결을 확인해주세요.';
                } else if (axiosError.code === 'ECONNABORTED' || (axiosError.message && axiosError.message.includes('timeout'))) {
                    errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
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
                    <Typography variant="h6" gutterBottom>클래스 입력</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {classList.map((item, index) => (
                            <ClassInputCard
                                key={`${idPrefix}-class-${classList.indexOf(item)}-${classList.length}`}
                                value={item}
                                onChange={(newValue) => handleInputChange(index, newValue)}
                                onDelete={() => removeClass(index)}
                                isRequired={index < TEST_MIN_CLASSES_COUNT}
                            />
                        ))}
                        {classList.length < TEST_MAX_CLASSES_COUNT && (
                            <IconButton onClick={addClass} color="primary">
                                <AddCircleOutlineIcon />
                            </IconButton>
                        )}
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" gutterBottom>파일 업로드</Typography>
                    <FileDropzone
                        onDrop={onDrop}
                        accept={{
                            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
                        }}
                        maxSize={5 * 1024 * 1024} // 5MB 제한
                        maxFiles={30} // 최대 30개 파일
                        disabled={isLoading}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Box>
                            <Typography variant="subtitle1">업로드된 이미지: {files.length} / 30</Typography>
                            {files.length > 0 && (
                                <Typography variant="caption" color="textSecondary">
                                    총 용량: {(files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(1)}MB
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
                            모든 이미지 삭제
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
                        분류 테스트 처리 중...
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
                {isLoading ? '처리 중...' : Strings.FreeTest.classifyTest}
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
