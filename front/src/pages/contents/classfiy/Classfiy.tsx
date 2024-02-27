import Box from "@mui/material/Box";
import FileDropzone from "component/FileDropzone";
import Grid from "@mui/material/Grid";
import { useCallback, useState } from "react";
import { List, ListItem, ListItemText } from "@mui/material";
import Button from "@mui/material/Button";
import { uploadImg } from "service/TrainApi";

const Classfiy = () => {
    const [files, setFiles] = useState([]);

    const onDrop = useCallback((files) => {
        console.log("files : ", files);

        const formData = new FormData();
        files.forEach((file, i) => {
            formData.append('files', file);
        });
        setFiles(files);

        //headers: { 'Content-Type': 'multipart/form-data' }
    }, [setFiles]);

    const onSave = () => {
        console.log("files : ", files);
        const formData = new FormData();
        files.forEach((file, i) => {
            formData.append('files', file);
        });
        uploadImg(formData).then((res) => {
            console.log("res : ", res);
        }).catch((err) => {
            console.log("err : ", err);
        });
    }

    return (
        <Box>
            <Grid item md={12}>
                <FileDropzone onDrop={onDrop} />
            </Grid>
            <Button onClick={onSave}>
                저장
            </Button>
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

export default Classfiy;