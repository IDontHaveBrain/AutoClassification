import TextField from '@mui/material/TextField';
import { type StandardTextFieldProps } from '@mui/material/TextField/TextField';

type BaseFieldProps = StandardTextFieldProps;

const BaseField = (props: BaseFieldProps) => {
  return <TextField {...props} />;
};

export default BaseField;
