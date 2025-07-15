import React, { useState } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Autocomplete, Chip, CircularProgress, Grid, IconButton, TextField, Typography } from '@mui/material';
import ExpandComp from 'component/ExpandComp';

interface Props {
  classes?: string[];
  onClassesChange: (_classes: string[]) => void;
  isLoading?: boolean;
  error?: string | null;
}

const WorkspaceClass: React.FC<Props> = ({ classes = [], onClassesChange, isLoading = false, error = null }) => {
  const [newClass, setNewClass] = useState<string>('');

  const handleAdd = () => {
    const safeClasses = classes ?? [];
    if (newClass && !safeClasses.includes(newClass)) {
      onClassesChange([...safeClasses, newClass]);
      setNewClass('');
    }
  };

  const handleRemove = (classToRemove: string) => {
    const safeClasses = classes ?? [];
    onClassesChange(safeClasses.filter((c) => c !== classToRemove));
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
        <Grid size="auto">
          <Autocomplete
            freeSolo
            options={classes ?? []}
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
        <Grid size="auto">
          <IconButton onClick={handleAdd} color="primary">
            <AddCircleOutlineIcon />
          </IconButton>
        </Grid>
        <Grid size="auto">
          <Grid container spacing={1}>
            {classes && classes.map((item) => (
              <Grid size="auto" key={item}>
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
