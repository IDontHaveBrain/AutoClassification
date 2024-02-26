import { Accept, useDropzone } from "react-dropzone";
import Box from "@mui/material/Box";

interface Props {
    onDrop: any;
    accept?: Accept;
    style?: any;
}

const FileDropzone = ({ onDrop, accept, style }: Props) => {
    const {getRootProps, getInputProps, isDragActive} = useDropzone({ onDrop, accept: accept });

    return (
        <Box
            {...getRootProps()}
            border={2}
            style={{borderStyle: 'dashed', padding: '20px'}}
        >
            <input {...getInputProps()} accept={Object.keys(accept || {}).join()} style={{display: 'none'}} />
            {isDragActive ? (
                <p>Drop the files here...</p>
            ) : (
                <p>Drag & drop some files here, or click to select files</p>
            )}
        </Box>
    );
};

export default FileDropzone;