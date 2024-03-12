import { useCallback, useContext, useEffect, useState } from "react";
import FileDropzone from "component/FileDropzone";
import { Avatar, Chip } from "@mui/material";
import { WorkspaceContext } from "utils/ContextManager";
import ExpandComp from "component/ExpandComp";

const WorkspaceDropZone = () => {
    const { state, setState } = useContext(WorkspaceContext);

    const onDrop = useCallback(
        (files) => {
            const newFiles = files.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                }),
            ) || [];

            setState((prevState) => {
                return {
                    ...prevState,
                    newFiles: newFiles,
                }
            });
        },
        [setState]
    );

    const handleRemoveFile = (index) => {
        const newFiles = state.newFiles.filter((file, i) => i !== index);

        setState({
            ...state,
            newFiles: newFiles,
        });
    };

    return (
        <ExpandComp title="Add Imgs">
            <FileDropzone onDrop={onDrop} />
            {state?.newFiles?.map((file, index) => (
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
