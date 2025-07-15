import TextField, { TextFieldProps } from "@mui/material/TextField";
import { StandardTextFieldProps } from "@mui/material/TextField/TextField";

interface BaseFieldProps extends StandardTextFieldProps {}

const BaseField = (props: BaseFieldProps) => {
  return <TextField {...props} />;
};

export default BaseField;
