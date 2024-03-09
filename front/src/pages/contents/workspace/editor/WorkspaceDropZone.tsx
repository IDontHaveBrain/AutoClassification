import React, { useCallback, useContext } from "react";
import FileDropzone from 'component/FileDropzone';
import { Chip, Avatar, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Grid from '@mui/material/Grid';
import { green } from '@mui/material/colors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PageContext } from 'component/PageContext'; // Ensure this path to be corrected according to your file structure

const WorkspaceDropZone = () => {
  const { pageState, setPageState } = useContext(PageContext);

  const onDrop = useCallback((files) => {
    const newFiles = files.map((file) => Object.assign(file, {
      preview: URL.createObjectURL(file),
    }));

    setPageState({
      ...pageState,
      files: newFiles
    });
  }, [setPageState]);

  const handleRemoveFile = (index) => {
    const newFiles = pageState.files.filter((file, i) => i !== index);

    setPageState({
      ...pageState,
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
          {pageState.files?.map((file, index) => (
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