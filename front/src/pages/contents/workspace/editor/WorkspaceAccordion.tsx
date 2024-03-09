import React, { useContext } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, TextField, IconButton, Grid } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { green } from "@mui/material/colors";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PageContext } from 'component/PageContext'; // Ensure this path to be corrected according to your file structure

const WorkspaceAccordion = () => {
  const { pageState, setPageState } = useContext(PageContext);

  const handleAdd= () => {
    if (pageState.classifyItems) {
      setPageState({
        ...pageState,
        classifyItems: [...pageState.classifyItems, '']
      });
    }
  };

  const handleRemove = (index) => {
    setPageState({
      ...pageState,
      classifyItems: pageState.classifyItems.filter((_, i) => i !== index)
    });
  };

  return (
    <Grid item md={true}>
      <Accordion sx={{border: '2px solid #c4c4c4'}}>
        <AccordionSummary sx={{ bgcolor: green[300] }} expandIcon={<ExpandMoreIcon />}>
          Classify
        </AccordionSummary>
        <AccordionDetails>
          <Grid container direction="row" spacing={2}>
            {pageState.classifyItems?.map((item, index) => (
              <Grid item key={index}>
                <TextField
                  value={item}
                  onChange={event => {
                    const newValue = event.target.value;
                    setPageState({
                      ...pageState,
                      classifyItems: pageState.classifyItems.map((_, i) =>
                        i === index ? newValue : item)
                    });
                  }}
                />
                <IconButton onClick={() => handleRemove(index)}>
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Grid>
            ))}
            <IconButton onClick={handleAdd}>
              <AddCircleOutlineIcon />
            </IconButton>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
};

export default WorkspaceAccordion;