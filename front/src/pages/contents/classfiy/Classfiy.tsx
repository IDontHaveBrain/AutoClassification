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
        // setFiles(files)

        setFiles(files.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        })));

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

    const images = files.map(file => (
        <div key={file.name}>
            <img src={file.preview} style={{width: '200px'}} alt='preview' />
        </div>
    ));

    return (
        <Box>
            <Grid item md={12}>
                <FileDropzone onDrop={onDrop} />
            </Grid>
            <aside style={{display: 'flex', flexWrap: 'wrap', marginTop: '15px'}}>
                {images}
            </aside>
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