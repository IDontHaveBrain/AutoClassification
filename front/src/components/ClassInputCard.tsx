import React from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box,Card, CardContent, IconButton, TextField } from '@mui/material';

interface ClassInputCardProps {
  value: string;
  onChange: (_value: string) => void;
  onDelete: () => void;
  isRequired: boolean;
}

const ClassInputCard: React.FC<ClassInputCardProps> = ({ value, onChange, onDelete, isRequired }) => {
  const { t } = useTranslation();

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
            helperText={isRequired && value.trim() === '' ? t('required', { ns: 'validation' }) : ''}
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
