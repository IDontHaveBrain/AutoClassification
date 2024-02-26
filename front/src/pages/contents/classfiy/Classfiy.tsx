import Box from "@mui/material/Box";
import FileDropzone from "component/FileDropzone";
import Grid from "@mui/material/Grid";
import { useCallback, useState } from "react";
import { List, ListItem, ListItemText } from "@mui/material";

const Classfiy = () => {
    const [files, setFiles] = useState([]);

    const onDrop = useCallback((files) => {
        console.log("files : ", files);

        const formData = new FormData();
        files.forEach((file, i) => {
            formData.append(i.toString(), file);
        });
        setFiles(files);

        //headers: { 'Content-Type': 'multipart/form-data' }
    }, [setFiles]);

    return (
        <Box>
            <Grid item md={12}>
                <FileDropzone onDrop={onDrop} accept={{'image/*': ["image/jpeg", "image/png"]}} />
            </Grid>
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