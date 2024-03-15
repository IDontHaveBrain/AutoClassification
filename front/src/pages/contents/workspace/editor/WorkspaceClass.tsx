import React from "react";
import { Grid, IconButton, TextField } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ExpandComp from "component/ExpandComp";

interface Props {
  state: any;
  setState: any;
}

const WorkspaceClass = ({state, setState}: Props) => {

  const handleAdd= () => {
    if (!state.classes) {
      setState({
        ...state,
        classes: ['']
      });
    } else {
      setState({
        ...state,
        classes: [...state.classes, '']
      });
    }
  };

  const handleRemove = (index) => {
    setState({
      ...state,
      classes: state.classes?.filter((_, i) => i !== index)
    });
  };

  const handleInputChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setState(prevState => ({
      ...prevState,
      classes: prevState.classes?.map((item, i) => (i === index ? newValue : item)),
    }));
  };

  return (
      <ExpandComp title="Classify">
        <Grid container direction="row" spacing={2}>
          {state?.classes && state.classes.map((item, index) => (
              <Grid item key={index}>
                <TextField
                    value={item}
                    onChange={handleInputChange(index)}
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
      </ExpandComp>
  );
};

export default WorkspaceClass;