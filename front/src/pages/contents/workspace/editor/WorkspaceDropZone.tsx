import { useCallback, useState } from "react";
import FileDropzone from "component/FileDropzone";
import { Avatar, Chip } from "@mui/material";
import ExpandComp from "component/ExpandComp";

const WorkspaceDropZone = ({ onFilesChange }) => {
    const [newFiles, setNewFiles] = useState([]);

    const onDrop = useCallback(
        (files) => {
            const updatedFiles = files.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                }),
            ) || [];

            setNewFiles(updatedFiles);
            onFilesChange(updatedFiles);
        },
        [onFilesChange]
    );

    const handleRemoveFile = (index) => {
        const updatedFiles = newFiles.filter((file, i) => i !== index);

        setNewFiles(updatedFiles);
        onFilesChange(updatedFiles);
    };

    return (
        <ExpandComp title="Add Imgs">
            <FileDropzone onDrop={onDrop} />
            {newFiles.map((file, index) => (
                <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => handleRemoveFile(index)}
                    avatar={<Avatar alt={file.name} src={file.preview} />}
                />
            ))}
        </ExpandComp>
    );
};

export default WorkspaceDropZone;