import React, {useCallback, useContext} from "react";
import FileDropzone from 'component/FileDropzone';
import {Accordion, AccordionDetails, AccordionSummary, Avatar, Chip} from '@mui/material';
import Grid from '@mui/material/Grid';
import {green} from '@mui/material/colors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {MenuItems} from "service/commons/MenuItem";
import {WorkspaceContext} from "utils/ContextManager";

const WorkspaceDropZone = () => {
  const {state, setState} = useContext(WorkspaceContext);
  const onDrop = useCallback((files) => {
    const newFiles = files.map((file) => Object.assign(file, {
      preview: URL.createObjectURL(file),
    }));

    setState({
      ...state,
      files: newFiles
    });
  }, [setState]);

  const handleRemoveFile = (index) => {
    const newFiles = state.files.filter((file, i) => i !== index);

    setState({
      ...state,
      files: newFiles
    });
  };

  return (
    <Grid item md={true}>
      <Accordion sx={{border: '2px solid #c4c4c4'}}>
        <AccordionSummary sx={{ bgcolor: green[300] }} expandIcon={<ExpandMoreIcon />}>
          Add Imgs
        </AccordionSummary>
        <AccordionDetails>
          <FileDropzone onDrop={onDrop} />
          {state.files?.map((file, index) => (
            <Chip
              key={index}
              label={file.name}
              onDelete={() => handleRemoveFile(index)}
              avatar={<Avatar alt={file.name} src={file.preview} />}
            />
          ))}
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
};

export default WorkspaceDropZone;