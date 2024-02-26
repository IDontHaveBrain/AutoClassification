import Box from "@mui/material/Box";
import FileDropzone from "component/FileDropzone";
import Grid from "@mui/material/Grid";
import { useCallback, useState } from "react";
import { List, ListItem, ListItemText } from "@mui/material";

const Classfiy = () => {
    const [files, setFiles] = useState([]);

    const onDrop = useCallback((files) => {
        console.log("files : ", files);
        setFiles(files);
    }, [setFiles]);

    return (
        <Box>
            <Grid item md={12}>
                <FileDropzone onDrop={onDrop} />
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