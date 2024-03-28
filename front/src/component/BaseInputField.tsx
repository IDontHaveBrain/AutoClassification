import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface BaseInputFieldProps {
    label: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const BaseInputField = ({ label, value, onChange }: BaseInputFieldProps) => {
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
                size={"small"}
            />
          </Grid>
        </Grid>
      </Box>
  );
};

export default BaseInputField;