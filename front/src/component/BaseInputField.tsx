import { styled } from "@mui/material";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface BaseInputFieldProps {
    label: string;
    value?: string;
    onChange?: any;
}

const BaseInputField = ({ label, value, onChange }: BaseInputFieldProps) => {
    return (
        <Box>
            <Grid container spacing={1} md justifyContent={"space-between"} alignItems={"center"}>
                <Grid item xs={11} container spacing={1} direction={"row"} alignItems={"center"}>
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
                <Grid item xs={1}>
                    <Button variant="contained" color="success" size={"small"} sx={{minHeight: "30px"}}>
                        Save
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BaseInputField;
