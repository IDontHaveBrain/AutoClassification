import React from "react";
import { Grid, IconButton, TextField } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ExpandComp from "component/ExpandComp";

interface Props {
  classes: string[];
  onClassesChange: (classes: string[]) => void;
}

const WorkspaceClass = ({classes, onClassesChange}: Props) => {

  const handleAdd= () => {
    if (!classes) {
      onClassesChange(['']);
    } else {
      onClassesChange([...classes, '']);
    }
  };

  const handleRemove = (index) => {
    onClassesChange(classes?.filter((_, i) => i !== index));
  };

  const handleInputChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onClassesChange(classes?.map((item, i) => (i === index ? newValue : item)));
  };

  return (
      <ExpandComp title="Classify">
        <Grid container direction="row" spacing={2}>
          {classes?.map((item, index) => (
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