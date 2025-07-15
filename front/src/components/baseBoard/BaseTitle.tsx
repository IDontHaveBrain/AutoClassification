import Typography from '@mui/material/Typography';

interface Props {
  title: string;
}

export const BaseTitle = ({ title }: Props) => {
  return (
    <Typography fontSize={'1.5rem'} gutterBottom fontWeight={'bold'}>
      {title}
    </Typography>
  );
};

export default BaseTitle;
