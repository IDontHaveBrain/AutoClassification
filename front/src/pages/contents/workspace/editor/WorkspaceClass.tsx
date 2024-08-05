import React, { useState } from "react";
import { Grid, IconButton, TextField, Chip, Autocomplete, CircularProgress, Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ExpandComp from "component/ExpandComp";

interface Props {
  classes?: string[];
  onClassesChange: (classes: string[]) => void;
  isLoading?: boolean;
  error?: string | null;
}

const WorkspaceClass: React.FC<Props> = ({ classes, onClassesChange, isLoading = false, error = null }) => {
  const [newClass, setNewClass] = useState<string>('');

  const handleAdd = () => {
    if (newClass && !classes.includes(newClass)) {
      onClassesChange([...classes, newClass]);
      setNewClass('');
    }
  };

  const handleRemove = (classToRemove: string) => {
    onClassesChange(classes.filter((c) => c !== classToRemove));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewClass(event.target.value);
  };

  if (isLoading) {
    return (
      <ExpandComp title="Classify">
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      </ExpandComp>
    );
  }

  if (error) {
    return (
      <ExpandComp title="Classify">
        <Typography color="error" align="center">{error}</Typography>
      </ExpandComp>
    );
  }

  return (
    <ExpandComp title="Classify">
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Autocomplete
            freeSolo
            options={classes}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add new class"
                variant="outlined"
                value={newClass}
                onChange={handleInputChange}
              />
            )}
            renderTags={(value: string[], getTagProps) =>
              value.map((option: string, index: number) => (
                <Chip key={option} variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
          />
        </Grid>
        <Grid item>
          <IconButton onClick={handleAdd} color="primary">
            <AddCircleOutlineIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <Grid container spacing={1}>
            {classes && classes.map((item, index) => (
              <Grid item key={index}>
                <Chip
                  label={item}
                  onDelete={() => handleRemove(item)}
                  color="primary"
                  variant="outlined"
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </ExpandComp>
  );
};

export default WorkspaceClass;
