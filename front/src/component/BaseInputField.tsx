import { styled } from "@mui/material";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useEditorContext } from "component/baseEditor/EditorContext";

interface BaseInputFieldProps {
  label: string;
  value?: string;
  onChange?: any;
}

const BaseInputField = ({ label, value, onChange }: BaseInputFieldProps) => {
  const { editor, setEditor } = useEditorContext();

  const handleTitleChange = (event) => {
    setEditor({ ...editor, title: event.target.value });
  };

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
            onChange={onChange ? onChange : handleTitleChange}
            value={editor?.title}
            defaultValue={value}
            size={"small"}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BaseInputField;
