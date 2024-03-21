import Box from "@mui/material/Box";
import FileDropzone from "component/FileDropzone";
import Grid from "@mui/material/Grid";
import { useCallback, useState } from "react";
import {
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import Button from "@mui/material/Button";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { testUploadImg } from "service/Apis/TrainApi";
import TextField from "@mui/material/TextField";
import { onAlert } from "component/modal/AlertModal";
import { Strings } from "utils/strings";

const TEST_MAX_CLASSES_COUNT = 5;
const TEST_MIN_CLASSES_COUNT = 2;

const TestClassfiy = () => {
    const [files, setFiles] = useState([]);
    const [classList, setClassList] = useState(["", ""]);

    const addClass = () => {
        if (classList.length < TEST_MAX_CLASSES_COUNT) {
            setClassList([...classList, ""]);
        } else {
            onAlert("You can add up to " + TEST_MAX_CLASSES_COUNT + " classes.");
        }
    };

    const handleInputChange = (index: number, newValue: string) => {
        if (index < TEST_MIN_CLASSES_COUNT && newValue.trim() === "") {
            onAlert("The first " + TEST_MIN_CLASSES_COUNT + " classes are mandatory.");
        } else {
            const newClassList = [...classList];
            newClassList[index] = newValue;
            setClassList(newClassList);
        }
    };

    const removeClass = (index: number) => {
        if (classList.length <= TEST_MIN_CLASSES_COUNT) {
            onAlert("You must keep at least " + TEST_MIN_CLASSES_COUNT + " classes.");
        } else {
            const newClassList = [...classList];
            newClassList.splice(index, 1);
            setClassList(newClassList);
        }
    };

    const onDrop = useCallback(
        (files) => {
            if (files.length > 30) {
                onAlert("분류 테스트는 이미지 30개 이하로 테스트 가능합니다.");
                return;
            }

            const formData = new FormData();
            files.forEach((file, i) => {
                formData.append("files", file);
            });

            setFiles(
                files.map((file) =>
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    }),
                ),
            );
        },
        [setFiles],
    );

    const onSave = () => {
        console.log("files : ", files);
        if (classList.some(item => item.trim() === "")) {
            onAlert(Strings.Common.notEmpty);
            return;
        }
        const formData = new FormData();
        files.forEach((file, i) => {
            formData.append("files", file);
        });
        formData.append("data", new Blob(
            [
                JSON.stringify(classList),
            ],
            { type: "application/json" },
        ));
        testUploadImg(formData)
            .then((res) => {
                setClassList(["", ""]);
                handleInputChange(0, "")
                handleInputChange(1, "")
                setFiles([]);
                onAlert(Strings.FreeTest.requestTest);
            })
            .catch((err) => {
                console.log("err : ", err);
                onAlert(Strings.Common.apiFailed);
            });
    };

    const onRemove = (index: number) => {
        const newFiles = files.filter((file, i) => i !== index);
        setFiles(newFiles);
    };

    const images = files.map((file, index) => (
        <div
            key={`${index}-${file.name}`}
            style={{position: "relative", display: "inline-block"}}
        >
            <img src={file.preview} style={{width: "200px"}} alt="preview"/>
            <button
                onClick={() => onRemove(index)}
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "red",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                X
            </button>
        </div>
    ));
    return (
        <Box>
            <Grid item md={12}>
                <FileDropzone onDrop={onDrop}/>
            </Grid>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}> {/* add flexbox to arrange the items in a row */}
                {classList.map((item, index) => (
                    <div key={index} style={{ display: 'flex', marginRight: '8px' }}>
                        <TextField
                            key={index}
                            size={"small"}
                            sx={{ m: 1 }}
                            value={classList[index]}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                        ></TextField>
                        <Button
                            style={{ minWidth: 'initial', lineHeight: 'initial', alignSelf: 'center' }}
                            onClick={() => removeClass(index)}
                        >X</Button>
                    </div>
                ))}
                <IconButton onClick={addClass}>
                    <AddCircleOutlineIcon />
                </IconButton>
            </div>
            <aside style={{display: "flex", flexWrap: "wrap", marginTop: "15px"}}>
                {images}
            </aside>
            <Grid item xs={12}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <Button onClick={onSave} color={"secondary"} variant={"contained"}>
                            {Strings.FreeTest.classifyTest}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
            <Divider sx={{mt: 2}}/>
            <List>
                {files.map((file, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={file.name}/>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default TestClassfiy;
