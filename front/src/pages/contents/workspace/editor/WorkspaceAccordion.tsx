import React, { useContext } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, TextField, IconButton, Grid } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { green } from "@mui/material/colors";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {MenuItems} from "service/commons/MenuItem";
import {WorkspaceContext} from "utils/ContextManager";

const WorkspaceAccordion = () => {
  const {state, setState} = useContext(WorkspaceContext);

  const handleAdd= () => {
    if (state.classifyItems) {
      setState({
        ...state,
        classifyItems: [...state.classifyItems, '']
      });
    }
  };

  const handleRemove = (index) => {
    setState({
      ...state,
      classifyItems: state.classifyItems.filter((_, i) => i !== index)
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
            {state.classifyItems?.map((item, index) => (
              <Grid item key={index}>
                <TextField
                  value={item}
                  onChange={event => {
                    const newValue = event.target.value;
                    setState({
                      ...state,
                      classifyItems: state.classifyItems.map((_, i) =>
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