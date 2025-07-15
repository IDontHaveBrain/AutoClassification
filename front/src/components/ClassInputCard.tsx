import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box,Card, CardContent, IconButton, TextField } from '@mui/material';
import { useTranslation } from 'hooks/useTranslation';

interface ClassInputCardProps {
  value: string;
  onChange: (_value: string) => void;
  onDelete: () => void;
  isRequired: boolean;
}

const ClassInputCard: React.FC<ClassInputCardProps> = ({ value, onChange, onDelete, isRequired }) => {
  const { t } = useTranslation('common');

  return (
    <Card variant="outlined" sx={{ minWidth: 200, m: 1 }}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <TextField
            fullWidth
            size="small"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            error={isRequired && value.trim() === ''}
            helperText={isRequired && value.trim() === '' ? t('forms.validation.required') : ''}
          />
          <IconButton onClick={onDelete} disabled={isRequired}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ClassInputCard;
