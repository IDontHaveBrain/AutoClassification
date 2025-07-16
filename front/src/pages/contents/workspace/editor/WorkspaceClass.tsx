import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Autocomplete, Chip, CircularProgress, Grid, IconButton, TextField, Typography } from '@mui/material';

import ExpandComp from 'components/ExpandComp';

interface Props {
  classes?: string[];
  onClassesChange: (_classes: string[]) => void;
  isLoading?: boolean;
  error?: string | null;
}

const WorkspaceClass: React.FC<Props> = ({ classes = [], onClassesChange, isLoading = false, error = null }) => {
  const { t } = useTranslation('common');
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
      <ExpandComp title={t('classify')}>
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      </ExpandComp>
    );
  }

  if (error) {
    return (
      <ExpandComp title={t('classify')}>
        <Typography color="error" align="center">{error}</Typography>
      </ExpandComp>
    );
  }

  return (
    <ExpandComp title={t('classify')}>
      <Grid container direction="column" spacing={2}>
        <Grid size="auto">
          <Autocomplete
            freeSolo
            options={classes ?? []}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('addNewClass')}
                variant="outlined"
                value={newClass}
                onChange={handleInputChange}
              />
            )}
            renderTags={(value: string[], getTagProps) =>
              value.map((option: string, index: number) => {
                const existingCount = value.slice(0, index).filter(item => item === option).length;
                const stableKey = `chip-${option}${existingCount > 0 ? `-${existingCount}` : ''}`;
                const { key: _key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip key={stableKey} variant="outlined" label={option} {...tagProps} />
                );
              })
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
