import TextField, { type StandardTextFieldProps } from '@mui/material/TextField';

type BaseFieldProps = StandardTextFieldProps;

const BaseField = (props: BaseFieldProps) => {
  return <TextField {...props} />;
};

export default BaseField;
