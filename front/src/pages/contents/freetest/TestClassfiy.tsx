import React, { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import FileDropzone from "component/FileDropzone";
import Grid from "@mui/material/Grid";
import {
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import { testUploadImg } from "service/Apis/TrainApi";
import { onAlert } from "component/modal/AlertModal";
import { Strings } from "utils/strings";
import ClassInputCard from "component/ClassInputCard";

const TEST_MAX_CLASSES_COUNT = 5;
const TEST_MIN_CLASSES_COUNT = 2;

const TestClassify: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [classList, setClassList] = useState<string[]>(["", ""]);

    const addClass = () => {
        if (classList.length < TEST_MAX_CLASSES_COUNT) {
            setClassList([...classList, ""]);
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
        (droppedFiles: File[]) => {
            if (droppedFiles.length > 30) {
                onAlert("분류 테스트는 이미지 30개 이하로 테스트 가능합니다.");
                return;
            }

            setFiles(
                droppedFiles.map((file) =>
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    }),
                ),
            );
        },
        [],
    );

    const onSave = () => {
        if (classList.some(item => item.trim() === "")) {
            onAlert(Strings.Common.notEmpty);
            return;
        }
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
        });
        formData.append("data", new Blob([JSON.stringify(classList)], { type: "application/json" }));
        
        testUploadImg(formData)
            .then(() => {
                setClassList(["", ""]);
                setFiles([]);
                onAlert(Strings.FreeTest.requestTest);
            })
            .catch((err) => {
                console.error("Error:", err);
                onAlert(Strings.Common.apiFailed);
            });
    };

    const onRemove = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
    };

    const onRemoveAll = () => {
        setFiles([]);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>클래스 입력</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {classList.map((item, index) => (
                            <ClassInputCard
                                key={index}
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
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>파일 업로드</Typography>
                    <FileDropzone onDrop={onDrop} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                        <Typography variant="subtitle1">{`업로드된 이미지: ${files.length}`}</Typography>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={onRemoveAll}
                            disabled={files.length === 0}
                        >
                            모든 이미지 삭제
                        </Button>
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                        {files.map((file: any, index) => (
                            <Box key={`${index}-${file.name}`} sx={{ position: "relative" }}>
                                <img src={file.preview} style={{ width: "100px", height: "100px", objectFit: "cover" }} alt="preview" />
                                <IconButton
                                    size="small"
                                    onClick={() => onRemove(index)}
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                                    }}
                                >
                                    X
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
            <Button onClick={onSave} color="secondary" variant="contained" sx={{ alignSelf: 'flex-start' }}>
                {Strings.FreeTest.classifyTest}
            </Button>
            <Divider />
            <List>
                {files.map((file, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={file.name} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default TestClassify;
