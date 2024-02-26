import { useDropzone } from "react-dropzone";
import Box from "@mui/material/Box";

interface Props {
    onDrop: any;
    style?: any;
}

const FileDropzone = ({ onDrop, style }: Props) => {
    const {getRootProps, getInputProps, isDragActive} = useDropzone({ onDrop });

    return (
        <Box
            {...getRootProps()}
            border={2}
            style={{borderStyle: 'dashed', padding: '20px'}}
        >
            <input {...getInputProps()} type="file" style={{display: 'none'}} />
            {isDragActive ? (
                <p>Drop the files here...</p>
            ) : (
                <p>Drag & drop some files here, or click to select files</p>
            )}
        </Box>
    );
};

export default FileDropzone;