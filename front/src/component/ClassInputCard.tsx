import React from 'react';
import { Card, CardContent, TextField, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface ClassInputCardProps {
  value: string;
  onChange: (value: string) => void;
  onDelete: () => void;
  isRequired: boolean;
}

const ClassInputCard: React.FC<ClassInputCardProps> = ({ value, onChange, onDelete, isRequired }) => {
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
            helperText={isRequired && value.trim() === '' ? '필수 입력입니다' : ''}
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
