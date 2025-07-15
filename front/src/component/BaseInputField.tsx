import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

interface BaseInputFieldProps {
    label: string;
    value?: string;
    onChange?: (_event: React.ChangeEvent<HTMLInputElement>) => void;
    readOnly?: boolean;
}

const BaseInputField = ({ label, value, onChange, readOnly = false }: BaseInputFieldProps) => {
  return (
      <Box>
        <Grid container direction="row" alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="h6">{label}</Typography>
          </Grid>
          <Grid item>
            <TextField
                id="custom-input"
                variant="outlined"
                onChange={onChange}
                value={value}
                size={'small'}
                InputProps={{
                    readOnly: readOnly,
                }}
                sx={{
                    '& .MuiInputBase-input': {
                        backgroundColor: readOnly ? 'transparent' : 'inherit',
                        cursor: readOnly ? 'default' : 'text',
                    },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: readOnly ? 'rgba(0, 0, 0, 0.23)' : 'inherit',
                        },
                        '&:hover fieldset': {
                            borderColor: readOnly ? 'rgba(0, 0, 0, 0.23)' : 'inherit',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: readOnly ? 'rgba(0, 0, 0, 0.23)' : 'inherit',
                        },
                    },
                }}
            />
          </Grid>
        </Grid>
      </Box>
  );
};

export default BaseInputField;